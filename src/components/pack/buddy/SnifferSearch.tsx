// SNIFFER — HĽADAŤ (kolo 2 §6.3, nákres plany/nakres-sniffer-kolo2-2026-09-25.html C1/C2).
// Hore LEN hlavička: tlačidlo filtra + prepínač **V okolí | FAR SNIFF ▾**.
//
// · V OKOLÍ — „všetkých vidíme" (Matej 25. 9., odpoveď 2): každý, kto má zapnuté „Ukazujem sa
//   v Ľudia v okolí", v okruhu môjho `radius_km` od môjho PINU. Pohlavie/vek/zámer sa
//   neuplatnia; blok, psie veto a brána áno. Server: `assnif_nearby` / `sniffer_nearby_ok`.
// · FAR SNIFF (Tinder „Passport", názov Matej 25. 9.) — schovaný pod rozbaľovačom: krajina,
//   text „kam sa chystáš", kedy. Mriežka = `assnif_search`, OBOJSTRANNE (`sniffer_pair_ok`).
//   Voľba sa pamätá v `human.heading` { country, when, date, note }.
// · Krajina SVIETI, keď má 40+ výletov so sprievodcom PÚTNIKA. Počty z katalógu (`trailCountry`).
import { useEffect, useMemo, useState } from 'react';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { trailCountry, countryName, flagUrl } from '@/lib/countryGeo';
import { useLang } from '@/i18n/LanguageContext';
import { withTransform } from '@/services/cloudinaryService';
import { AinubisBubble } from '@/components/pack/ainubisSheet';
import { saveHuman, useProfile, INTENT_OPTIONS } from '@/components/pack/profile/packProfile';
import {
  PACK_THEME as T, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_SHADOW, FONT_UI,
} from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS, tintRGBA } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { loadNearby, searchPeople, type SnifferCardData, type SnifferHeading } from './snifferDeck';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;
type Mode = 'near' | 'far';

/** Prah „svieti" — sprievodca PÚTNIKA má zmysel od 40 výletov (Matej 25. 9., nákres). */
const GLOW_AT = 40;
/** Susedia, ktorí sa ukážu aj s nulou — cesta tam je bežná, sprievodca ešte nie. */
const ALWAYS = ['sk', 'cz', 'at', 'pl', 'hu', 'si', 'hr', 'ch'];
const WHEN: Array<[SnifferHeading['when'], string]> = [['now', 'Now'], ['week', 'In a week'], ['summer', 'In summer'], ['date', 'Pick a date']];
const MODE_KEY = 'dogypt_sniffer_search_mode';

const pic = (u?: string | null) => withTransform(u, 'c_fill,g_auto,w_300,h_400,f_auto,q_auto');
const readMode = (): Mode => { try { return localStorage.getItem(MODE_KEY) === 'far' ? 'far' : 'near'; } catch { return 'near'; } };
const writeMode = (m: Mode) => { try { localStorage.setItem(MODE_KEY, m); } catch { /* pohodlie, nič viac */ } };

const CSS = `
.ss-head{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;}
.ss-flt{flex:0 0 auto;width:${PACK_SPACE.xxl + PACK_SPACE.sm}px;height:${PACK_SPACE.xxl + PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${T.border};background:${T.cardSoft};display:flex;align-items:center;justify-content:center;cursor:pointer;}
.ss-flt.is-on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
.ss-segs{flex:1 1 auto;display:flex;gap:${PACK_SPACE.xs}px;padding:${PACK_SPACE.xs}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.border};background:${T.cardSoft};}
.ss-seg{flex:1 1 0;padding:${PACK_SPACE.sm}px;border:0;border-radius:${PACK_R.pill}px;background:transparent;cursor:pointer;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkWarm};white-space:nowrap;}
.ss-seg.is-on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)};font-weight:600;}
.ss-flag{flex:0 0 auto;height:${PACK_SPACE.xxl + PACK_SPACE.sm}px;padding:0 ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${LAPIS.edge};
  background:${T.cardSoft};display:flex;align-items:center;cursor:pointer;}
.ss-flag img{width:${PACK_SPACE.xl}px;height:${PACK_SPACE.lg}px;object-fit:cover;}
.ss-drop{padding:${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.ss-world{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.ss-ctry{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px ${PACK_SPACE.xs}px ${PACK_SPACE.xs}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${T.border};background:${T.tileBg};cursor:pointer;opacity:.6;font-family:${FONT_UI};text-align:left;}
.ss-ctry img{width:${PACK_SPACE.xl}px;height:${PACK_SPACE.lg}px;object-fit:cover;}
.ss-ctry span{display:flex;flex-direction:column;font-size:${PACK_TEXT.label}px;color:${T.inkStrong};}
.ss-ctry small{font-size:${PACK_TEXT.micro}px;color:${T.inkDim};}
.ss-ctry.is-glow{opacity:1;box-shadow:0 0 0 1px ${T.accentGold}, 0 0 ${PACK_SPACE.md}px ${tintRGBA(T.accentGold, 0.55)};}
.ss-ctry.is-on{opacity:1;${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
.ss-note{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.ss-area{width:100%;min-height:${PACK_SPACE.xxxl + PACK_SPACE.md}px;resize:vertical;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.ss-pills{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.ss-pills .pk-pill{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;}
.ss-pills .pk-pill.is-on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
.ss-date{border-radius:${PACK_R.field}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;}
.ss-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:${PACK_SPACE.md}px;}
.ss-mini{display:flex;flex-direction:column;overflow:hidden;padding:0;cursor:pointer;text-align:left;font-family:${FONT_UI};}
.ss-mini img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;}
.ss-mini b{padding:${PACK_SPACE.sm}px ${PACK_SPACE.sm}px 0;font-weight:600;font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.ss-mini span{padding:0 ${PACK_SPACE.sm}px ${PACK_SPACE.sm}px;font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.ss-mini:hover{box-shadow:${PACK_SHADOW.panel};}
`;

export function SnifferSearch({ tx, onOpen }: { tx: Tx; onOpen: (card: SnifferCardData) => void }) {
  const { profile } = useProfile();
  const { lang } = useLang();
  // Meno krajiny v jazyku appky (`countryName` vracia EN). Prehliadač bez Intl → EN.
  const ctryName = useMemo(() => {
    try { const dn = new Intl.DisplayNames([lang], { type: 'region' }); return (iso: string) => dn.of(iso.toUpperCase()) ?? countryName(iso); }
    catch { return countryName; }
  }, [lang]);
  const human = profile?.human;
  const heading = human?.heading;
  const country = heading?.country ?? 'sk';
  const [mode, setModeRaw] = useState<Mode>(readMode);
  const [dropOpen, setDropOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [intent, setIntent] = useState<string | null>(null);
  const [people, setPeople] = useState<SnifferCardData[] | null>(null);
  const [note, setNote] = useState(heading?.note ?? '');
  useEffect(() => { setNote(heading?.note ?? ''); }, [heading?.note]);

  const setMode = (m: Mode) => {
    if (m === 'far') setDropOpen(mode === 'far' ? !dropOpen : true);
    else setDropOpen(false);
    setModeRaw(m); writeMode(m);
  };

  const countries = useMemo(() => {
    const n = new Map<string, number>();
    for (const tr of HERO_TRAILS) { const c = trailCountry(tr); n.set(c, (n.get(c) ?? 0) + 1); }
    const all = new Set([...ALWAYS, ...n.keys()]);
    return [...all].map((c) => ({ iso: c, trips: n.get(c) ?? 0 })).sort((a, b) => b.trips - a.trips || a.iso.localeCompare(b.iso));
  }, []);

  const setHeading = (patch: Partial<SnifferHeading>) =>
    void saveHuman({ heading: { country, when: heading?.when ?? 'now', ...heading, ...patch } });

  useEffect(() => {
    let live = true;
    setPeople(null);
    const q = mode === 'near' ? loadNearby(intent) : searchPeople(country, [], intent);
    q.then((r) => { if (live) setPeople(r); }).catch(() => { if (live) setPeople([]); });
    return () => { live = false; };
  }, [mode, country, intent]);

  const myIntents: string[] = (human?.intents ?? []).filter((i) => i !== 'community');
  const hasPin = !!human?.pin;
  const km = (p: SnifferCardData) => (p.distance_km != null ? tx('pack.sniffer.kmAway', '{n} km away', { n: Math.max(1, Math.round(Number(p.distance_km))) }) : '');

  return (
    <>
      <style>{CSS}</style>
      <div className="ss-head">
        <button type="button" className={`ss-flt${filterOpen || intent ? ' is-on' : ''}`} aria-pressed={filterOpen}
          aria-label={tx('pack.sniffer.search.filter', 'Filter')} onClick={() => setFilterOpen((v) => !v)}>
          <BrandIcon name="sliders" size={PACK_SPACE.lg} tint="dark" />
        </button>
        <div className="ss-segs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'near'} className={`ss-seg${mode === 'near' ? ' is-on' : ''}`}
            onClick={() => setMode('near')}>{tx('pack.sniffer.search.near', 'Nearby')}</button>
          <button type="button" role="tab" aria-selected={mode === 'far'} aria-expanded={dropOpen} className={`ss-seg${mode === 'far' ? ' is-on' : ''}`}
            onClick={() => setMode('far')}>
            FAR SNIFF {dropOpen ? '▴' : '▾'}
          </button>
        </div>
        {/* Vybraná krajina je VLASTNÝ chip, nie súčasť tlačidla FAR SNIFF (Matej 25. 9.). */}
        {mode === 'far' && (
          <button type="button" className="ss-flag" aria-expanded={dropOpen} onClick={() => setDropOpen((v) => !v)}
            aria-label={tx('pack.sniffer.pin.country', 'Country')}>
            <img src={flagUrl(country)} alt="" />
          </button>
        )}
      </div>

      {filterOpen && myIntents.length > 0 && (
        <div className="ss-pills">
          {INTENT_OPTIONS.filter((o) => myIntents.includes(o.value)).map((o) => (
            <button key={o.value} type="button" aria-pressed={intent === o.value}
              className={`pk-pill pk-pill--tap${intent === o.value ? ' is-on' : ''}`}
              onClick={() => setIntent(intent === o.value ? null : o.value)}>{tx(`pack.buddy.intent.${o.value}`, o.labelEN)}</button>
          ))}
        </div>
      )}

      {mode === 'far' && dropOpen && (
        <section className="ss-drop" style={{ ...PACK_BOX.card }}>
          <div className="ss-world">
            {countries.map((c) => (
              <button key={c.iso} type="button" aria-pressed={c.iso === country}
                className={`ss-ctry${c.trips >= GLOW_AT ? ' is-glow' : ''}${c.iso === country ? ' is-on' : ''}`}
                onClick={() => setHeading({ country: c.iso })}>
                <img src={flagUrl(c.iso)} alt="" />
                <span>{ctryName(c.iso)}<small>{tx(`pack.sniffer.trips.${c.trips === 1 ? 'one' : c.trips >= 2 && c.trips <= 4 ? 'few' : 'other'}`, '{n} trips', { n: c.trips })}</small></span>
              </button>
            ))}
          </div>
          <textarea className="pf-field ss-area" maxLength={140} value={note} onChange={(e) => setNote(e.target.value)}
            onBlur={() => { if ((heading?.note ?? '') !== note.trim()) setHeading({ note: note.trim() || undefined }); }}
            placeholder={tx('pack.sniffer.search.notePh', 'Where are you heading? Find a buddy before you go…')} />
          <div className="ss-pills">
            {WHEN.map(([w, en]) => (
              <button key={w} type="button" aria-pressed={heading?.when === w}
                className={`pk-pill pk-pill--tap${heading?.when === w ? ' is-on' : ''}`}
                onClick={() => setHeading({ when: w })}>{tx(`pack.sniffer.search.when.${w}`, en)}</button>
            ))}
            {heading?.when === 'date' && (
              <input type="date" className="pf-field ss-date" value={heading.date ?? ''} onChange={(e) => setHeading({ date: e.target.value })} />
            )}
          </div>
          <p className="ss-note">{tx('pack.sniffer.search.glowNote', 'Lit up = {n}+ trips with the PILGRIM guide · find a buddy there before you go', { n: GLOW_AT })}</p>
        </section>
      )}

      {mode === 'near' && (
        <p className="ss-note" style={{ textAlign: 'center' }}>
          {hasPin
            ? tx('pack.sniffer.search.nearNote', 'Everyone around your pin who shows up here')
            : tx('pack.sniffer.search.noPin', 'Drop your pin in settings (My patch) to see who’s around.')}
        </p>
      )}

      {people && people.length > 0 && (
        <div className="ss-grid">
          {people.map((p) => (
            <button key={p.member} type="button" className="ss-mini" style={{ ...PACK_BOX.row }} onClick={() => onOpen(p)}>
              <img src={pic(p.photos[0] ?? p.dogs[0]?.photo)} alt="" />
              <b>{p.name}{p.age ? `, ${p.age}` : ''}</b>
              <span>{[p.pilgrimLevel ? tx('pack.sniffer.pilgrimLv', 'Pilgrim {n}', { n: p.pilgrimLevel }) : '', km(p) || p.region].filter(Boolean).join(' · ')}</span>
            </button>
          ))}
        </div>
      )}
      {people && people.length === 0 && (mode === 'far' || hasPin) && (
        <AinubisBubble>{mode === 'near'
          ? tx('pack.sniffer.search.emptyNear', 'Nobody around you is showing up here yet.')
          : tx('pack.sniffer.search.empty', 'Nobody here yet who fits you both ways. Try another patch or intent.')}</AinubisBubble>
      )}
      {mode === 'far' && (
        <p className="ss-note" style={{ textAlign: 'center' }}>{tx('pack.sniffer.search.mutual', 'You only see people you’re also shown to.')}</p>
      )}
    </>
  );
}
