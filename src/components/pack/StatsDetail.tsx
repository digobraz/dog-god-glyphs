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
import { pokladnica, rozvojZostatok, type PrijemMesiac } from '@/lib/pokladnica';
import { PokladnicaSheet, DALSI_UTULOK, VYPLATA_UTULKU, MILION, type Suplik } from './PokladnicaSheet';
import { HandArrowLeft } from './HandIcons';
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
.sd-step{display:grid;grid-template-columns:76px minmax(0,1fr) 56px;align-items:center;gap:${PACK_SPACE.sm}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
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
.sd-dr{display:grid;grid-template-columns:8px minmax(0,1fr) auto 12px;align-items:center;gap:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;width:100%;padding:${PACK_SPACE.md}px 0;background:none;border:0;border-top:1px solid ${T.border};cursor:pointer;text-align:left;font-family:${FONT_UI};color:${T.inkStrong};}
.sd-dr:first-of-type{border-top:0;padding-top:${PACK_SPACE.sm}px;}
.sd-dr .nm{font-size:${PACK_TEXT.label}px;font-weight:600;letter-spacing:.02em;text-transform:uppercase;white-space:nowrap;overflow:hidden;}
.sd-dr .v{font-size:${PACK_TEXT.body}px;font-weight:600;white-space:nowrap;}
.sd-dr .ch{color:${T.inkWarm};font-size:${PACK_TEXT.label}px;}
.sd-dr .s2{grid-column:2/4;display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.sd-dr .s2 b{font-weight:600;color:${T.inkStrong};}
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
  const [kasaRaw, setKasaRaw] = useState<{ t: { dev: number; affiliate: number; help: number; hektor: number }; mesiace: PrijemMesiac[] } | null>(null);
  const [suplik, setSuplik] = useState<Suplik | null>(null);

  // Pokladnica — ten istý zdroj ako dashboard, DOGYPTLAND aj `TransparentStats` (get-dashboard-stats).
  useEffect(() => {
    let live = true;
    fetch(`${EDGE_BASE}/get-dashboard-stats`).then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (live && d && !d.error && d.treasuries) setKasaRaw({ t: d.treasuries, mesiace: d.revenue_by_month ?? [] }); })
      .catch(() => {});
    return () => { live = false; };
  }, []);
  // Príjem vs. náklady (lib/pokladnica.ts) — mesiace sa dopočítajú k dnešku, účet rastie sám.
  const kasa = useMemo(() => (kasaRaw ? pokladnica(kasaRaw.mesiace) : null), [kasaRaw]);
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const eur = (n: number) => new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n));

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
  // Pokladnica = TRI šuplíky (Matej 23. 10.: „sú len 3 šuplíky"). Farba a meno z TRANSPARENCY_SPLIT.
  const [pRozvoj, pPomoc, pMiska] = TRANSPARENCY_SPLIT;
  const zostatok = kasa && kasaRaw ? rozvojZostatok(kasaRaw.t.dev, kasaRaw.t.affiliate, kasa.naklady) : 0;
  const pomoc = kasaRaw?.t.help ?? 0;
  const miska = kasaRaw?.t.hektor ?? 0;

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

      {/* ③ POKLADNICA — tri šuplíky; ťuk otvorí šuplík cez celú obrazovku (PokladnicaSheet) */}
      {kasa && kasaRaw && (
        <div className="sd-sub" style={{ ...PACK_BOX.subblock }}>
          <span className="sd-lbl">{tx('pack.kasa.now', 'Treasury · now {sum}').replace('{sum}', eur(zostatok + pomoc + miska))}</span>
          <button type="button" className="sd-dr" onClick={() => setSuplik('rozvoj')}>
            <i className="sd-dot" style={{ background: pRozvoj.color }} /><span className="nm">{t(pRozvoj.labelKey)}</span><span className="v">{eur(zostatok)}</span><span className="ch" aria-hidden><HandArrowLeft size={12} style={{ transform: 'scaleX(-1)' }} /></span>
            <span className="s2"><span>{tx('pack.kasa.inOut', 'income {a} · costs {b}').replace('{a}', eur(kasa.prijem)).replace('{b}', eur(kasa.naklady))}</span></span>
          </button>
          <button type="button" className="sd-dr" onClick={() => setSuplik('pomoc')}>
            <i className="sd-dot" style={{ background: pPomoc.color }} /><span className="nm">{t(pPomoc.labelKey)}</span><span className="v">{eur(pomoc)}</span><span className="ch" aria-hidden><HandArrowLeft size={12} style={{ transform: 'scaleX(-1)' }} /></span>
            <span className="s2">
              <span className="pk-progress"><span className="pk-progress__fill" style={{ ...fillW(((pomoc % VYPLATA_UTULKU) / VYPLATA_UTULKU) * 100), background: pPomoc.color }} /></span>
              <span>{tx('pack.kasa.missing', 'missing {n} · {shelter}').replace('{n}', eur(VYPLATA_UTULKU - (pomoc % VYPLATA_UTULKU))).replace('{shelter}', `${DALSI_UTULOK.meno} ${DALSI_UTULOK.mesto}`)}</span>
            </span>
          </button>
          <button type="button" className="sd-dr" onClick={() => setSuplik('miska')}>
            <i className="sd-dot" style={{ background: pMiska.color }} /><span className="nm">{t(pMiska.labelKey)}</span><span className="v">{eur(miska)}</span><span className="ch" aria-hidden><HandArrowLeft size={12} style={{ transform: 'scaleX(-1)' }} /></span>
            <span className="s2"><span>{tx('pack.kasa.toMillion', 'to a million {n}').replace('{n}', eur(MILION - miska))}</span></span>
          </button>
        </div>
      )}

      {/* ④ TEMPO */}
      {stats && (
        <div className="sd-pills">
          <span className="pk-pill"><b style={{ color: T.growGreen }}>+{fmt(stats.last30d)}</b>{t('pack.notif.perMonth')}</span>
          <span className="pk-pill"><b>{fmt(countries.length)}</b>{t('pack.notif.countries')}</span>
          <span className="pk-pill"><b>{fmt(stats.total)}</b>{t('pack.notif.peopleWord')}</span>
        </div>
      )}

      {suplik && kasa && (
        <PokladnicaSheet
          suplik={suplik}
          color={(suplik === 'rozvoj' ? pRozvoj : suplik === 'pomoc' ? pPomoc : pMiska).color}
          title={t((suplik === 'rozvoj' ? pRozvoj : suplik === 'pomoc' ? pPomoc : pMiska).labelKey)}
          onClose={() => setSuplik(null)}
          eur={eur}
          locale={loc}
          tx={tx}
          zostatok={zostatok}
          kasa={kasa}
          suma={suplik === 'pomoc' ? pomoc : miska}
        />
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
