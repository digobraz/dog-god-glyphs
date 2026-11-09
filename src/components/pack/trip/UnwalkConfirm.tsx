// OTÁZKA PRED ZRUŠENÍM PREJDENÉHO VÝLETU.
//
// Matej 5. 10. 2026: „ak omylom kliknem na pil označený výlet walked tak ho hneď zruším a stratím
// body... tam by mala byť otázka naozaj chceš zrušiť tento výlet? prídeš o body aj kilometre".
// Zelená pilulka „✓ Prejdené" je to isté tlačidlo, ktorým sa výlet zapisuje — jeden klik navyše
// ho zhodil bez slova a vzal so sebou body, km psa aj hodnotenie.
//
// Prečo okno a nie dvojklik (`DeleteButton`): pilulka sedí na fotke karty, kde niet miesta na
// vetu o následku — a následok (body + km) je presne to, čo má človek vidieť pred potvrdením.
//
// Blok = PANEL (`PACK_BOX.panel`) na ZÁVOJI, rovnako ako úprava výletu. Bezpečná voľba je HLAVNÁ
// (lapis, fokus): Enter ani náhodný druhý klik nič nezmaže. Zrušenie je tichý text v červenej,
// ktorú používa `DeleteButton` — jeden význam, jedna farba.
import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useT, useLang } from '@/i18n/LanguageContext';
import { APP_NEW } from '@/lib/packFlags';
import { PACK_THEME as T, PACK_BOX, FONT_TITLE, FONT_UI, VEIL_CSS, VEIL_PAD } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';

const DANGER = '#CE4B3C';

const CSS = `${VEIL_CSS}
.uwc-overlay{z-index:1250;padding:${VEIL_PAD};}
.uwc-box{width:100%;max-width:400px;padding:24px;text-align:center;
  background:${PACK_BOX.panel.background};border:${PACK_BOX.panel.border};border-radius:${PACK_BOX.panel.borderRadius}px;box-shadow:${PACK_BOX.panel.boxShadow};}
.uwc-title{font-family:${FONT_TITLE};font-weight:700;font-size:16px;letter-spacing:0.02em;text-transform:uppercase;color:${T.inkStrong};line-height:1.25;}
.uwc-name{font-family:${FONT_UI};font-size:12px;color:${T.inkWarm};margin-top:4px;}
.uwc-loss{font-family:${FONT_UI};font-size:14px;color:${T.inkStrong};line-height:1.5;margin:16px 0 24px;}
.uwc-loss b{color:${DANGER};font-weight:600;}
.uwc-keep{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;padding:12px;border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.edge};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.uwc-keep:hover{background:${LAPIS.gradHover};}
/* APPKA: PAPYRUS 3D. Zachovať = lapis, zrušiť prejdenie (mazanie) = CELÉ ČERVENÉ TLAČIDLO 3D (Matej 9. 11. 2026). */
html.papyrus3d .uwc-box{background:var(--p3d-card);border:0;border-top:6px solid var(--p3d-gold);box-shadow:0 6px 0 var(--p3d-ink),0 14px 18px var(--p3d-sh);}
html.papyrus3d .uwc-title{font-family:'LT Museum',serif;font-weight:900;font-size:20px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);} /* písmo: nadpis */
html.papyrus3d .uwc-keep.pk-b3,html.papyrus3d .uwc-drop.pk-b3{width:100%;height:56px;padding:0 16px;margin-top:0;border:2.5px solid var(--b3-l);border-radius:var(--b3-r);background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--b3-i);font:400 20px/1 'LT Museum',serif;letter-spacing:0;text-transform:none;text-decoration:none;box-shadow:var(--p3d-b3);} /* písmo: cta */
html.papyrus3d .uwc-drop.pk-b3{margin-top:16px;}
.uwc-drop{margin-top:12px;background:none;border:0;padding:8px;font-family:${FONT_UI};font-weight:500;font-size:12px;letter-spacing:0.02em;color:${DANGER};text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
`;

export function UnwalkConfirm({ name, points, km, onConfirm, onClose }: {
  name: string;
  /** Body, ktoré zrušenie vezme — to isté číslo, ktoré sľubovala pilulka pri zápise. */
  points: number;
  /** Km trasy (textové pole výletu, napr. „9.0"); prázdne = veta bez km. */
  km?: string | number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const keepRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    keepRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const kmNum = Number(km);
  const hasKm = Number.isFinite(kmNum) && kmNum > 0;
  const loss = t(hasKm ? 'pack.map.unwalk.lossKm' : 'pack.map.unwalk.loss')
    .replace('{points}', String(points))
    .replace('{km}', hasKm ? kmNum.toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '');
  // Čísla sú v **…** — následok má byť to prvé, čo oko chytí. Bez innerHTML: preklad je text.
  const parts = loss.split('**');

  return createPortal(
    <div className="pk-veil pk-veil--modal uwc-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="uwc-box" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <style>{CSS}</style>
        <div className="uwc-title">{t('pack.map.unwalk.title')}</div>
        <div className="uwc-name">{name}</div>
        <p className="uwc-loss">{parts.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p))}</p>
        <button ref={keepRef} type="button" className={`uwc-keep${APP_NEW ? ' pk-b3 pk-b3--lapis' : ''}`} onClick={onClose}>{t('pack.map.unwalk.keep')}</button>
        <button type="button" className={`uwc-drop${APP_NEW ? ' pk-b3 pk-b3--red' : ''}`} onClick={() => { onConfirm(); onClose(); }}>{t('pack.map.unwalk.confirm')}</button>
      </div>
    </div>,
    document.body,
  );
}
