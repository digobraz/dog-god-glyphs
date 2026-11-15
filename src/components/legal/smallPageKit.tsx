/**
 * DROBNÉ STRÁNKY V ŠATE PAPYRUS 3D — /lost/:slug, 404, /privacy, /terms, /will/:token (Matej 15. 11. 2026: „oprav to všetko“).
 * Len pod `APP_NEW` (`html.papyrus3d`); web na dogypt.com ostáva bez zmeny, kým Matej neschváli prepnutie.
 * Recept: karta `--p3d-card` + obrys 2,5 px + pera (`lib/papyrus3d.ts`), hladký papyrus `pk-paper pk-plain`,
 * kruhová šípka `BackButton`, nadpis LT Museum bez rozstrelu.
 */
import { PageTopBar } from '@/components/PageTopBar';
import { BackButton } from '@/components/pack/BackButton';
import { PAPER_PAGE_CSS } from '@/components/pack/packTheme';

/** Trieda koreňa stránky pod šatom: hladký papyrus bez tapety (rovnako ako /pack). */
export const SP_PAPER = 'pk-paper pk-plain';

/** Horná lišta: logo + jazyk z `PageTopBar`, kruhová šípka vľavo (`onBack` = bez nej). */
export function SmallTop({ onBack, backLabel }: { onBack?: () => void; backLabel: string }) {
  return (
    <div className="sp-top">
      <PageTopBar />
      {onBack && <BackButton tone="pale" onClick={onBack} label={backLabel} className="sp-back" style={{ position: 'absolute' }} />}
    </div>
  );
}

export const SMALL_P3D_CSS = `${PAPER_PAGE_CSS}
.sp-top{position:relative;display:flow-root;}
.sp-top .sp-back{position:absolute;left:16px;top:calc(env(safe-area-inset-top,0px) + 17px);z-index:3;}
@media (min-width:768px){.sp-top .sp-back{top:calc(env(safe-area-inset-top,0px) + 31px);}}
.sp-card{background:var(--p3d-card);border:2.5px solid var(--p3d-ink);border-radius:16px;box-shadow:var(--p3d-pera);}
.sp-title{margin:0;font-family:'LT Museum',serif;font-weight:400;font-size:24px;line-height:1.2;letter-spacing:.01em;text-transform:none;color:var(--p3d-ink);text-wrap:balance;}
`;
