// ── VŠETKY ŠTATISTIKY v paneli upozornení — JEDNA OBRAZOVKA BEZ SCROLLU (23. 10. 2026) ──────────
// Matej: „detail toho otvorenia musíme prerobiť tak, aby to nebolo na scrolling… zmenšiť planétku aj
// tú misiu nejak inak… aj tie rebríčky iný dizajn… aj tú pokladnicu musíme lepšie vymyslieť" →
// nákres `plany/nakres-statistiky-2026-10-23.html`, Matej „sprav" na odporúčanie
// A (misia + malá planéta, pokladnica = pás) · rebríček z B (prepínač Krajiny / Plemená).
//
// · Homepage drží ďalej `GlobePulse` (D-BLOK) — tu sa skladá z tých istých kúskov: živý `PackGlobe`,
//   `MILESTONES`-rebrík, `RankingBoardsModal` na celý rebríček, `TRANSPARENCY_SPLIT` na pokladnicu.
// · Zlúčenie ISO2/ISO3 a prekladov plemien je TO ISTÉ ako v `GlobePulse` (audit 26. 9.) — inak by
//   Slovensko stálo v rebríčku dvakrát.
import { useEffect, useMemo, useState } from 'react';
import { PackGlobe, MILESTONES } from './GlobePulse';
import { RankingBoardsModal } from './Ranking';
import { PACK_BOX, PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_UI, PILL_CSS, PROGRESS_CSS } from './packTheme';
import { LAPIS, pickTintCSS, PICK_INK } from './navGoldSkin';
import { TRANSPARENCY_SPLIT } from '@/lib/transparency';
import { countryISO2, iso2ToISO3 } from '@/lib/countryGeo';
import { localizeBreed } from '@/lib/breedDisplay';
import { flagUrl } from '@/lib/flagUrl';
import { EDGE_BASE } from '@/lib/env';
import { intlLocale } from '@/i18n/bcp47';
import { useT, useLang } from '@/i18n/LanguageContext';

const T = PACK_THEME;

export type StatsDetailData = {
  dogs: number;
  total: number;
  last30d: number;
  topCountries: { country: string; count: number }[];
  topBreeds: { breed: string; count: number }[];
};

const ROWS = 5;

/** Šírka výplne PROGRESU (recept `.pk-progress`) — rovnaký pomocník ako v `PackDogs` a `VaultKnowledge`. */
const fillW = (pct: number) => {
  const w = `${Math.min(100, Math.max(0, pct))}%`;
  return { display: 'block', width: w };
};

const CSS = `${PILL_CSS}${PROGRESS_CSS}
.sd{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.sd-sub{padding:${PACK_SPACE.md}px;}
.sd-lbl{font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.sd-num{font-family:${FONT_UI};font-weight:600;color:${T.inkStrong};line-height:1;}
.sd-mis{display:flex;gap:${PACK_SPACE.lg}px;align-items:center;}
.sd-globe{flex:0 0 auto;width:96px;height:96px;}
.sd-ladder{flex:1;min-width:0;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.sd-head{display:flex;justify-content:space-between;align-items:baseline;gap:${PACK_SPACE.sm}px;}
.sd-step{display:grid;grid-template-columns:76px minmax(0,1fr) auto;align-items:center;gap:${PACK_SPACE.sm}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.sd-step.on{color:${T.inkStrong};font-weight:600;}
.sd-step b{font-weight:600;text-align:right;}
.sd-tabs{display:flex;gap:${PACK_SPACE.sm}px;margin-bottom:${PACK_SPACE.sm}px;}
.sd-tabs .pk-pill{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;}
.sd-tabs .pk-pill.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.sd-rows{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.sd-row{display:grid;grid-template-columns:16px 16px minmax(0,96px) minmax(0,1fr) auto;align-items:center;gap:${PACK_SPACE.sm}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkStrong};}
.sd-row.nf{grid-template-columns:16px minmax(0,112px) minmax(0,1fr) auto;}
.sd-row i{font-style:normal;font-size:${PACK_TEXT.micro}px;color:${T.inkDim};}
.sd-row img{width:16px;height:12px;border-radius:2px;object-fit:cover;}
.sd-row span{white-space:nowrap;overflow:hidden;text-overflow:clip;}
.sd-row b{font-weight:600;min-width:24px;text-align:right;}
.sd-more{margin-top:${PACK_SPACE.sm}px;background:none;border:0;padding:0;cursor:pointer;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${LAPIS.edge};}
.sd-split{display:flex;gap:2px;height:12px;border-radius:${PACK_R.pill}px;overflow:hidden;margin-top:${PACK_SPACE.md}px;}
.sd-leg{display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;margin-top:${PACK_SPACE.sm}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkStrong};}
.sd-leg span{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;min-width:0;}
.sd-dot{flex:0 0 auto;width:8px;height:8px;border-radius:${PACK_R.pill}px;}
.sd-pills{display:flex;flex-wrap:wrap;justify-content:center;gap:${PACK_SPACE.sm}px;}
.sd-pills .pk-pill{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;}
.sd-pills b{font-weight:600;}
`;

export function StatsDetail({ stats }: { stats: StatsDetailData | null }) {
  const t = useT();
  const { lang } = useLang();
  const loc = intlLocale(lang);
  const fmt = (n: number) => n.toLocaleString(loc);
  const [tab, setTab] = useState<'country' | 'breed'>('country');
  const [boardsOpen, setBoardsOpen] = useState(false);
  const [revenue, setRevenue] = useState<number | null>(null);

  // Pokladnica — ten istý zdroj ako dashboard aj `TransparentStats` (get-dashboard-stats).
  useEffect(() => {
    let live = true;
    fetch(`${EDGE_BASE}/get-dashboard-stats`).then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (live && d && !d.error) setRevenue(Number(d.revenue_total) || 0); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  const total = stats?.dogs ?? 0;
  const countries = useMemo(() => {
    const by = new Map<string, number>();
    for (const r of stats?.topCountries ?? []) {
      const iso = countryISO2(r.country);
      const k = iso ? iso2ToISO3(iso) : r.country.trim().toUpperCase();
      by.set(k, (by.get(k) ?? 0) + r.count);
    }
    return [...by.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [stats?.topCountries]);
  const breeds = useMemo(() => {
    const by = new Map<string, number>();
    for (const r of stats?.topBreeds ?? []) {
      const label = localizeBreed(r.breed, lang);
      by.set(label, (by.get(label) ?? 0) + r.count);
    }
    return [...by.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [stats?.topBreeds, lang]);

  // Názov krajiny z ISO kódu prehliadačom (žiadny vlastný slovník krajín).
  const names = useMemo(() => {
    try { return new Intl.DisplayNames([loc], { type: 'region' }); } catch { return null; }
  }, [loc]);
  const countryName = (iso3: string) => {
    const iso2 = countryISO2(iso3);
    return (iso2 && names?.of(iso2.toUpperCase())) || iso3;
  };

  const activeIdx = (() => {
    const i = MILESTONES.findIndex((m) => total < m.target);
    return i === -1 ? MILESTONES.length - 1 : i;
  })();
  const rows = (tab === 'country' ? countries : breeds).slice(0, ROWS);
  const top = rows[0]?.count || 1;
  // Pokladnica: 8 € komunity sa ukazuje rozdelená (5 + 3), tak ako po rozkliku dnes.
  const split = TRANSPARENCY_SPLIT.flatMap((p) => (p.parts.length ? p.parts : [p]));

  return (
    <div className="sd">
      <style>{CSS}</style>

      {/* ① MISIA — malá živá planéta + rebrík štyroch fáz */}
      <div className="sd-sub sd-mis" style={{ ...PACK_BOX.subblock }}>
        <div className="sd-globe"><PackGlobe topCountries={countries.map((c) => ({ country: c.label, count: c.count }))} /></div>
        <div className="sd-ladder">
          <div className="sd-head">
            <span className="sd-lbl">{t('pack.bones.mission')}</span>
            <span className="sd-num" style={{ fontSize: PACK_TEXT.h2 }}>{fmt(total)}</span>
          </div>
          {MILESTONES.map((m, i) => (
            <div key={m.nameKey} className={`sd-step${i === activeIdx ? ' on' : ''}`}>
              <span>{t(m.nameKey)}</span>
              <span className="pk-progress">
                {i <= activeIdx && <span className="pk-progress__fill" style={fillW(i < activeIdx ? 100 : Math.max(2, (total / m.target) * 100))} />}
              </span>
              <b>{m.target >= 1_000_000 ? '1 M' : fmt(m.target)}</b>
            </div>
          ))}
        </div>
      </div>

      {/* ② REBRÍČEK — jeden, cez celú šírku, prepínač Krajiny / Plemená */}
      <div className="sd-sub" style={{ ...PACK_BOX.subblock }}>
        <div className="sd-tabs">
          {(['country', 'breed'] as const).map((k) => (
            <button key={k} type="button" className={`pk-pill pk-pill--tap${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>
              {t(k === 'country' ? 'pack.globe.topCountries' : 'pack.globe.topBreeds')}
            </button>
          ))}
        </div>
        <div className="sd-rows">
          {rows.map((r, i) => (
            <div key={r.label} className={`sd-row${tab === 'breed' ? ' nf' : ''}`}>
              <i>{String(i + 1).padStart(2, '0')}</i>
              {tab === 'country' && (countryISO2(r.label)
                ? <img src={flagUrl(countryISO2(r.label)!.toLowerCase())} alt="" />
                : <i />)}
              <span>{tab === 'country' ? countryName(r.label) : r.label}</span>
              <span className="pk-progress"><span className="pk-progress__fill" style={fillW(Math.max(2, (r.count / top) * 100))} /></span>
              <b>{fmt(r.count)}</b>
            </div>
          ))}
        </div>
        <button type="button" className="sd-more" onClick={() => setBoardsOpen(true)}>{t('pack.rank.allBoards')}</button>
      </div>

      {/* ③ POKLADNICA — jeden pás s legendou */}
      <div className="sd-sub" style={{ ...PACK_BOX.subblock }}>
        <div className="sd-head">
          <span className="sd-lbl">{t('pack.invite.transparencySubtitle', { price: '€11' })}</span>
          {revenue !== null && (
            <span className="sd-num" style={{ fontSize: PACK_TEXT.body }}>
              {new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(revenue)}
            </span>
          )}
        </div>
        <div className="sd-split">
          {split.map((p) => <span key={p.labelKey} style={{ flex: p.share, background: p.color }} />)}
        </div>
        <div className="sd-leg">
          {split.map((p) => (
            <span key={p.labelKey}><i className="sd-dot" style={{ background: p.color }} />{p.share} € {t(p.labelKey)}</span>
          ))}
        </div>
      </div>

      {/* ④ TEMPO */}
      {stats && (
        <div className="sd-pills">
          <span className="pk-pill"><b style={{ color: T.growGreen }}>+{fmt(stats.last30d)}</b>{t('pack.notif.perMonth')}</span>
          <span className="pk-pill"><b>{fmt(countries.length)}</b>{t('pack.notif.countries')}</span>
          <span className="pk-pill"><b>{fmt(stats.total)}</b>{t('pack.notif.peopleWord')}</span>
        </div>
      )}

      {boardsOpen && (
        <RankingBoardsModal
          title={t('pack.rank.allBoards')}
          boards={[
            { title: t('pack.globe.topCountries'), rows: countries, kind: 'country' },
            { title: t('pack.globe.topBreeds'), rows: breeds, kind: 'breed' },
          ]}
          onClose={() => setBoardsOpen(false)}
        />
      )}
    </div>
  );
}
