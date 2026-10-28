// POKLADNICA — šuplík otvorený cez celú obrazovku (Matej 23. 10. 2026, nákres `plany/nakres-pokladnica-2026-10-23.html`).
// Tri šuplíky: ROZVOJ (príjem vs. náklady po mesiacoch + práca) · PRIAMA POMOC (do výplaty útulku) · MISKA.
// Čísla nič nevysvetľujú, len ukazujú (Matej: „nevysvetľovať… čísla hovoria samy").
import { useEffect, useMemo, useState } from 'react';
import { BackButton } from './BackButton';
import { HandArrowLeft } from './HandIcons';
import { PACK_BOX, PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_TOPROW, FONT_UI, FONT_TITLE, VEIL_CSS, PROGRESS_CSS } from './packTheme';
import { type Mesiac, type Polozka } from '@/lib/pokladnica';

const T = PACK_THEME;
export type Suplik = 'rozvoj' | 'pomoc' | 'miska';

/** Ďalší útulok na výplatu — Matej 23. 10. 2026: „útulok pes a mačka v Kremnici". */
export const DALSI_UTULOK = { meno: 'Pes a mačka', mesto: 'Kremnica' };
export const VYPLATA_UTULKU = 200;   // € — výplata útulku pri každých 200 € (plany/severka.md, 9. 10. 2026)
export const MILION = 1_000_000;

/** Výplň PROGRESU (recept `.pk-progress`) — ten istý pomocník ako `fillW` v StatsDetail. */
const fill = (pct: number, background: string) => {
  const w = `${Math.min(100, Math.max(0, pct))}%`;
  return { display: 'block', width: w, background };
};

const CSS = `${PROGRESS_CSS}
.kp-root.pk-veil{z-index:210;padding:0;align-items:stretch;}
.kp{width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;}
/* Mobil = šuplík cez celú obrazovku (nákres); od 768 plávajúci panel. */
@media (min-width:768px){.kp-root.pk-veil{padding:${PACK_SPACE.xl}px;align-items:center;}.kp{width:min(100%,480px);height:auto;max-height:100%;}.kp .kp-top{padding-top:${PACK_SPACE.lg}px;}}
/* Mobil = cez celú obrazovku, takže šípka NESMIE ísť pod hodiny: rad = spoločná hlavička /pack (safe-area + PACK_TOPROW.top, výška PACK_TOPROW.h) — 28. 10. 2026. */
.kp-top{display:flex;align-items:center;gap:${PACK_SPACE.md}px;box-sizing:content-box;min-height:${PACK_TOPROW.h}px;padding:calc(env(safe-area-inset-top,0px) + ${PACK_TOPROW.top}px) ${PACK_SPACE.lg}px ${PACK_SPACE.sm}px;}
.kp-top h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};}
.kp-body{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px calc(env(safe-area-inset-bottom,0px) + ${PACK_SPACE.lg}px);}
.kp-sub{padding:${PACK_SPACE.md}px;}
.kp-lbl{font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.kp-hero{display:flex;justify-content:space-between;align-items:baseline;gap:${PACK_SPACE.sm}px;}
.kp-hero b{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.h1}px;color:${T.inkStrong};white-space:nowrap;}
.kp-tot{display:flex;justify-content:space-between;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.xs}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.kp-tot b{font-weight:600;color:${T.inkStrong};}
.kp-mh,.kp-mo{display:grid;grid-template-columns:minmax(56px,auto) 1fr 1fr 12px;gap:${PACK_SPACE.sm}px;align-items:center;}
.kp-mh{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px 0;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.kp-mo{width:100%;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;line-height:1.6;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkStrong};text-align:left;cursor:pointer;}
.kp-mo b{font-weight:600;}
.kp-mo i{font-style:normal;color:${T.inkWarm};transition:transform .2s ease;}
.kp-mo.open i{transform:rotate(90deg);}
.kp-det{padding:0 ${PACK_SPACE.md}px ${PACK_SPACE.sm}px;}
.kp-it{display:flex;justify-content:space-between;gap:${PACK_SPACE.sm}px;padding:0;line-height:1.6;border-top:1px solid ${T.border};font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkStrong};}
.kp-it b{font-weight:600;white-space:nowrap;}
.kp-it.work{color:${T.inkDim};}
.kp-kv{display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.md}px;}
.kp-kv div{padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;}
.kp-kv b{display:block;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.h2}px;color:${T.inkStrong};}
.kp-kv span{font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.kp-bar{margin-top:${PACK_SPACE.md}px;}
.kp-shel{padding:${PACK_SPACE.md}px;font-family:${FONT_UI};}
.kp-shel b{display:block;font-size:${PACK_TEXT.body}px;font-weight:600;color:${T.inkStrong};}
.kp-shel span{font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
`;

type Props = {
  suplik: Suplik;
  color: string;
  title: string;
  onClose: () => void;
  eur: (n: number) => string;
  locale: string;
  tx: (key: string, fallback: string) => string;
  // ROZVOJ
  zostatok?: number;
  kasa?: { mesiace: Mesiac[]; prijem: number; naklady: number; praca: { hodiny: number; sadzba: number; eur: number; mesacne: number } };
  // POMOC · MISKA
  suma?: number;
};

/** Mesiace bez príjmu na začiatku (pred launchom) zlúči do jedného riadku „jan – máj". */
function zlucPredLaunchom(mesiace: Mesiac[]) {
  const out = [...mesiace];
  const pred: Mesiac[] = [];
  while (out.length && out[out.length - 1].prijem === 0) pred.push(out.pop()!);   // od najstaršieho
  if (pred.length < 2) return { riadky: mesiace, rozsah: null as null | [string, string] };
  const pol = new Map<string, Polozka>();
  for (const m of pred) for (const p of m.polozky) {
    const c = pol.get(p.id); pol.set(p.id, c ? { ...c, eur: c.eur + p.eur } : { ...p });
  }
  const spolu: Mesiac = { m: pred[0].m, prijem: 0, naklady: pred.reduce((a, q) => a + q.naklady, 0), polozky: [...pol.values()].sort((a, b) => b.eur - a.eur) };
  return { riadky: [...out, spolu], rozsah: [pred[0].m, pred[pred.length - 1].m] as [string, string] };
}

export function PokladnicaSheet(p: Props) {
  const { tx, eur } = p;
  const [open, setOpen] = useState<string | null>(p.kasa?.mesiace[0]?.m ?? null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') p.onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p.onClose]);

  const mesName = (m: string) => {
    const [y, mo] = m.split('-').map(Number);
    return new Date(y, mo - 1, 1).toLocaleString(p.locale, { month: 'short' }).replace('.', '');
  };
  const zluc = useMemo(() => (p.kasa ? zlucPredLaunchom(p.kasa.mesiace) : null), [p.kasa]);

  const rozvoj = p.kasa && zluc && (
    <>
      <div className="kp-sub" style={{ ...PACK_BOX.subblock }}>
        <div className="kp-hero"><span className="kp-lbl">{tx('pack.kasa.inTreasury', 'In the treasury')}</span><b>{eur(p.zostatok ?? 0)}</b></div>
        <div className="kp-tot"><span>{tx('pack.kasa.incomeTotal', 'Income in total')}</span><b>{eur(p.kasa.prijem)}</b></div>
        <div className="kp-tot"><span>{tx('pack.kasa.costsTotal', 'Costs in total')}</span><b>{eur(p.kasa.naklady)}</b></div>
        <div className="kp-tot">
          <span>{tx('pack.kasa.work', 'Work {h} h × {r} €').replace('{h}', p.kasa.praca.hodiny.toLocaleString(p.locale)).replace('{r}', String(p.kasa.praca.sadzba))}</span>
          <b>{eur(p.kasa.praca.eur)}</b>
        </div>
      </div>
      <div className="kp-mh"><span>{tx('pack.kasa.month', 'Month')}</span><span>{tx('pack.kasa.income', 'Income')}</span><span>{tx('pack.kasa.costs', 'Costs')}</span><span /></div>
      {zluc.riadky.map((m) => {
        const isOpen = open === m.m;
        const label = zluc.rozsah && m.m === zluc.rozsah[0] ? `${mesName(zluc.rozsah[0])} – ${mesName(zluc.rozsah[1])}` : mesName(m.m);
        const months = zluc.rozsah && m.m === zluc.rozsah[0]
          ? (Number(zluc.rozsah[1].slice(5)) - Number(zluc.rozsah[0].slice(5)) + 1) : 1;
        return (
          <div key={m.m} style={{ ...PACK_BOX.row }}>
            <button type="button" className={`kp-mo${isOpen ? ' open' : ''}`} style={{ background: 'none', border: 0 }}
              aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : m.m)}>
              <span>{label}</span><b>{eur(m.prijem)}</b><b>{eur(m.naklady)}</b><i aria-hidden><HandArrowLeft size={12} style={{ transform: 'scaleX(-1)' }} /></i>
            </button>
            {isOpen && (
              <div className="kp-det">
                {m.polozky.map((q) => <div key={q.id} className="kp-it"><span>{q.nazov}</span><b>{eur(q.eur)}</b></div>)}
                <div className="kp-it work">
                  <span>{tx('pack.kasa.work', 'Work {h} h × {r} €').replace('{h}', String(p.kasa!.praca.mesacne * months)).replace('{r}', String(p.kasa!.praca.sadzba))}</span>
                  <b>{eur(p.kasa!.praca.mesacne * months * p.kasa!.praca.sadzba)}</b>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  const suma = p.suma ?? 0;
  const zbytok = suma % VYPLATA_UTULKU;
  const pomoc = (
    <>
      <div className="kp-sub" style={{ ...PACK_BOX.subblock }}>
        <div className="kp-hero"><span className="kp-lbl">{tx('pack.kasa.nextPayout', 'Next payout to a shelter')}</span><b>{eur(zbytok)} / {eur(VYPLATA_UTULKU)}</b></div>
        <div className="pk-progress kp-bar"><span className="pk-progress__fill" style={fill((zbytok / VYPLATA_UTULKU) * 100, p.color)} /></div>
        <div className="kp-kv">
          <div style={{ ...PACK_BOX.row }}><b>{eur(VYPLATA_UTULKU - zbytok)}</b><span>{tx('pack.kasa.stillMissing', 'still missing')}</span></div>
          <div style={{ ...PACK_BOX.row }}><b>{Math.floor(suma / VYPLATA_UTULKU)}×</b><span>{tx('pack.kasa.paidOut', 'paid out')}</span></div>
        </div>
      </div>
      <span className="kp-lbl">{tx('pack.kasa.receives', 'Receives')}</span>
      <div className="kp-shel" style={{ ...PACK_BOX.subblock }}><b>{DALSI_UTULOK.meno}</b><span>{DALSI_UTULOK.mesto}</span></div>
    </>
  );

  const miska = (
    <div className="kp-sub" style={{ ...PACK_BOX.subblock }}>
      <div className="kp-hero"><span className="kp-lbl">{tx('pack.kasa.bowlGoal', 'The road to a million')}</span><b>{eur(suma)}</b></div>
      <div className="pk-progress kp-bar"><span className="pk-progress__fill" style={fill(Math.max(1, (suma / MILION) * 100), p.color)} /></div>
      <div className="kp-tot"><span>{tx('pack.kasa.toMillionLbl', 'still to a million')}</span><b>{eur(MILION - suma)}</b></div>
    </div>
  );

  // BEZ portálu: panel upozornení sa zatvára pri kliku MIMO seba (PackNotifications, mousedown),
  // šuplík preto musí ležať v jeho strome.
  return (
    <div className="kp-root pk-veil pk-veil--modal" role="dialog" aria-modal="true" aria-label={p.title}
      onClick={(e) => { if (e.target === e.currentTarget) p.onClose(); }}>
      <style>{VEIL_CSS}</style>
      <style>{CSS}</style>
      <div className="kp" style={{ ...PACK_BOX.panel, borderRadius: PACK_R.card }}>
        <div className="kp-top">
          <BackButton tone="pale" onClick={p.onClose} label={tx('pack.network.close', 'Close')} />
          <h2>{p.title}</h2>
        </div>
        <div className="kp-body">{p.suplik === 'rozvoj' ? rozvoj : p.suplik === 'pomoc' ? pomoc : miska}</div>
      </div>
    </div>
  );
}
