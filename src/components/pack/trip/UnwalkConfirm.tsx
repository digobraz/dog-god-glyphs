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
import { useEffect, useRef } from 'react';
import { useT, useLang } from '@/i18n/LanguageContext';
import { PACK_THEME as T, PACK_BOX, FONT_TITLE, FONT_UI, VEIL_CSS } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';

const DANGER = '#CE4B3C';

const CSS = `${VEIL_CSS}
.uwc-overlay{z-index:1250;padding:16px;}
.uwc-box{width:100%;max-width:400px;padding:24px;text-align:center;
  background:${PACK_BOX.panel.background};border:${PACK_BOX.panel.border};border-radius:${PACK_BOX.panel.borderRadius}px;box-shadow:${PACK_BOX.panel.boxShadow};}
.uwc-title{font-family:${FONT_TITLE};font-weight:700;font-size:16px;letter-spacing:0.02em;text-transform:uppercase;color:${T.inkStrong};line-height:1.25;}
.uwc-name{font-family:${FONT_UI};font-size:12px;color:${T.inkWarm};margin-top:4px;}
.uwc-loss{font-family:${FONT_UI};font-size:14px;color:${T.inkStrong};line-height:1.5;margin:16px 0 24px;}
.uwc-loss b{color:${DANGER};font-weight:600;}
.uwc-keep{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;padding:12px;border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.edge};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.uwc-keep:hover{background:${LAPIS.gradHover};}
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

  return (
    <div className="pk-veil pk-veil--modal uwc-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="uwc-box" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <style>{CSS}</style>
        <div className="uwc-title">{t('pack.map.unwalk.title')}</div>
        <div className="uwc-name">{name}</div>
        <p className="uwc-loss">{parts.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p))}</p>
        <button ref={keepRef} type="button" className="uwc-keep" onClick={onClose}>{t('pack.map.unwalk.keep')}</button>
        <button type="button" className="uwc-drop" onClick={() => { onConfirm(); onClose(); }}>{t('pack.map.unwalk.confirm')}</button>
      </div>
    </div>
  );
}
