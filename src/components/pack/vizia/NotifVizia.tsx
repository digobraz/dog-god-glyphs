// PANEL UPOZORNENÍ, záložky Práve pracujeme · Vízia · Hotovo (23. 11. 2026, zadanie `plany/zadanie-panel-upozornenia-2026-11-23.md`).
// Bohaté ikonky (52 px) žijú LEN tu; Upozornenia nesú systémové. Dáta = príspevky AINUBISA (`viziaData.ts`), ťuk = detail s ❤️ a komentármi.
// Vzhľad kariet (`.ntf-card`, `.ntf-vz*`) je v `notifP3d.ts`.
import type React from 'react';
import { Fragment, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang, useT } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { LikeMark, CommentMark } from '@/components/pack/SysIcon';
import { useViziaPlans, viziaIconOf, type ViziaKind, type ViziaRow } from './viziaData';
import { useViziaText, VIZIA_CSS } from './ViziaParts';
import { ViziaDetail } from './PackVizia';

function Card({ r, onOpen, right }: { r: ViziaRow; onOpen: () => void; right: React.ReactNode }) {
  const x = useViziaText(r);
  return (
    <button type="button" className="ntf-card ntf-vz" onClick={onOpen}>
      <img className="ntf-vz-ico" src={viziaIconOf(r.id, r.icon)} alt="" draggable={false} loading="lazy" />
      <span className="ntf-vz-tx"><b>{x.name}</b><span className="ntf-vz-p">{x.text}</span></span>
      <span className="ntf-vz-r">{right}</span>
    </button>
  );
}

export default function NotifVizia({ kind }: { kind: ViziaKind }) {
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const { lang } = useLang();
  const { rows, ready, reload } = useViziaPlans(true);
  const [open, setOpen] = useState<ViziaRow | null>(null);
  const list = rows.filter((r) => r.kind === kind);

  const body = () => {
    if (!ready) return <><div className="pk-skel ntf-vz-sk" aria-hidden /><div className="pk-skel ntf-vz-sk" aria-hidden /></>;
    if (!list.length) return kind === 'wip' ? <p className="ntf-vz-empty">{tx('pack.notif.wipEmpty', 'We are choosing the next step. Give a paw to the plan in Vision you want most.')}</p> : null;
    if (kind === 'plan') {
      const groups: Array<{ ms: number; list: ViziaRow[] }> = [];
      for (const r of list) {
        const g = groups.find((x) => x.ms === r.milestone);
        if (g) g.list.push(r); else groups.push({ ms: r.milestone, list: [r] });
      }
      groups.sort((a, b) => a.ms - b.ms);
      return groups.map((g) => (
        <Fragment key={g.ms}>
          <h3 className="ntf-sec ntf-vz-ms">{tx('pack.vizia.at', 'at {n} dogs').replace('{n}', g.ms.toLocaleString(intlLocale(lang)))}</h3>
          {g.list.map((r) => (
            <Card key={r.postId} r={r} onOpen={() => setOpen(r)}
              right={<><span><LikeMark on={r.liked} n={r.likes} />{r.likes}</span><span><CommentMark n={r.comments} />{r.comments}</span></>} />
          ))}
        </Fragment>
      ));
    }
    const sorted = kind === 'done' ? [...list].sort((a, b) => a.order - b.order) : list;
    return sorted.map((r) => (
      <Card key={r.postId} r={r} onOpen={() => setOpen(r)}
        right={kind === 'done' && r.doneAt
          ? <span className="ntf-vz-date">{new Date(r.doneAt).toLocaleDateString(intlLocale(lang))}</span>
          : <><span><LikeMark on={r.liked} n={r.likes} />{r.likes}</span><span><CommentMark n={r.comments} />{r.comments}</span></>} />
    ));
  };

  return (
    <>
      <style>{VIZIA_CSS}</style>
      <div className="ntf-vz-list">{body()}</div>
      {/* Detail nad panelom (panel má z-index 2100, PostViewer 1300) — preto portál s vlastnou vrstvou. */}
      {open && createPortal(
        <div style={{ position: 'relative', zIndex: 2200 }}>
          <ViziaDetail r={open} lang={lang} onClose={() => { setOpen(null); void reload(); }} />
        </div>,
        document.body,
      )}
    </>
  );
}
