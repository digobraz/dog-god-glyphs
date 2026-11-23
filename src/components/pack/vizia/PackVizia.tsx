// ČO STAVIAME `/pack/staviame` — prehľad všetkých plánov (balík 4, 23. 11. 2026). Kôš 2 POZERÁM SA (lock architektura-pack §3:
// lišta ustúpi, hore šípka späť; register `wizSteps.ts`). Vstup z JA: karta pri Misii v úprave profilu (`MisiaGroup.tsx`).
// Matej: *„v obrazovke, kde budú všetky, bude prehľad aj lajky“*. Plán = príspevok AINUBISA (`viziaData.ts`), ťuk ho otvorí
// v `PostViewer` (text, DOGMA, ❤️, komentáre). Zoskupené podľa míľnika („pri 1 000 psoch“), v skupine stav a počty.
import { Fragment, useEffect, useMemo, useState } from 'react';
import { PackLayout } from '@/components/pack/PackLayout';
import { SosStyles, useBack } from '@/components/pack/sos/sosShared';
import { PostViewer } from '@/components/pack/profile/PostViewer';
import { useLang, useT } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { PACK_THEME as T, PACK_SPACE as S, PACK_TEXT as TX, PACK_R, PILL_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useViziaPlans, markViziaSeen, viziaAsPost, type ViziaRow } from './viziaData';
import { VIZIA_CSS, ViziaLead, ViziaRowButton, useViziaText, AI_AVATAR } from './ViziaParts';

// ⚠️ JS template literal — spätný apostrof v komentári ho ukončí (`npm run check:css`).
const CSS = `${PILL_CSS}${VIZIA_CSS}
.vzp-root{display:flex;flex-direction:column;gap:${S.lg}px;font-family:${FONT_UI};color:${T.inkStrong};}
.vzp-title{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.h1}px;line-height:1.15;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: nadpis */
.vzp-intro{margin:0;font-size:${TX.body}px;line-height:1.5;color:${T.inkWarm};}
.vzp-grp{display:flex;flex-direction:column;gap:${S.sm}px;}
.vzp-ms{margin:${S.sm}px 0 0;font-size:${TX.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.vzp-empty{padding:${S.xl}px ${S.lg}px;text-align:center;font-size:${TX.label}px;color:${T.inkWarm};}
.vzp-sk{height:72px;border-radius:${PACK_R.tile}px;}
`;

export default function PackVizia() {
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const { lang } = useLang();
  const onBack = useBack('/pack/profile/edit');
  const { rows, ready, reload } = useViziaPlans();
  const [open, setOpen] = useState<ViziaRow | null>(null);

  // Obrazovka otvorená = zmeny videné (pripomienka vo feede zhasne).
  useEffect(() => { markViziaSeen(rows); }, [rows]);

  const groups = useMemo(() => {
    const out: Array<{ ms: number; list: ViziaRow[] }> = [];
    for (const r of rows) {
      const g = out.find((x) => x.ms === r.milestone);
      if (g) g.list.push(r); else out.push({ ms: r.milestone, list: [r] });
    }
    return out.sort((a, b) => a.ms - b.ms);
  }, [rows]);

  return (
    <PackLayout onBack={onBack} backLabel={tx('pack.vizia.back', 'Back')}>
      <SosStyles />
      <style>{CSS}</style>
      <div className="vzp-root">
        <h1 className="vzp-title">{tx('pack.vizia.title', 'What we are building')}</h1>
        <p className="vzp-intro">{tx('pack.vizia.intro', 'Plans we dream of. Give a paw to the ones you want and leave us a comment.')}</p>
        {!ready && <><div className="pk-skel vzp-sk" aria-hidden /><div className="pk-skel vzp-sk" aria-hidden /><div className="pk-skel vzp-sk" aria-hidden /></>}
        {ready && !rows.length && <p className="vzp-empty">{tx('pack.vizia.empty', 'Plans are being prepared.')}</p>}
        {groups.map((g) => (
          <Fragment key={g.ms}>
            <h2 className="vzp-ms">{tx('pack.vizia.at', 'at {n} dogs').replace('{n}', g.ms.toLocaleString(intlLocale(lang)))}</h2>
            <div className="vzp-grp">
              {g.list.map((r) => <ViziaRowButton key={r.postId} r={r} onOpen={() => setOpen(r)} />)}
            </div>
          </Fragment>
        ))}
      </div>
      {open && <ViziaDetail r={open} lang={lang} onClose={() => { setOpen(null); void reload(); }} />}
    </PackLayout>
  );
}

/** Detail = ten istý príspevok ako vo feede (`PostViewer`), len s ikonkou namiesto fotky. */
export function ViziaDetail({ r, lang, onClose, focusComment }: { r: ViziaRow; lang: string; onClose: () => void; focusComment?: string | null }) {
  const x = useViziaText(r);
  return (
    <PostViewer post={viziaAsPost(r, x.text)} name="AINUBIS" avatar={AI_AVATAR} dogs={[]} mine={false} system
      lead={<ViziaLead r={r} />} lang={lang} focusComment={focusComment} onClose={onClose} />
  );
}
