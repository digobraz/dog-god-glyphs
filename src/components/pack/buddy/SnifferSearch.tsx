// SNIFFER — HĽADAŤ ako Passport (zadanie-sniffer-stavba §2.5, nákres C/HĽADAŤ).
// „Kam sa chystáš?" krajina + kedy → pod tým filter rajón + zámer → mriežka ľudí.
// · Krajina SVIETI, keď má 40+ výletov so sprievodcom PÚTNIKA (dnes len SK). Počty sa rátajú
//   z katalógu trás (`trailCountry`), nie natvrdo.
// · Voľba sa ukladá do `human.heading` { country, when, date }, aby ju appka pamätala.
//   Server ju na kartu vydáva (`sniffer_card.heading`), ale karta ju ZATIAĽ NEUKAZUJE —
//   ⚠️ či majú ostatní vidieť „chystá sa do Slovinska v lete", nepadlo (otázka na Mateja).
// · Mriežka = server (`assnif_search`) nad TOU ISTOU podmienkou ako balíček: len obojstranne.
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
import { searchPeople, type SnifferCardData, type SnifferHeading } from './snifferDeck';
import { areaLabel } from './SnifferAreas';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

/** Prah „svieti" — sprievodca PÚTNIKA má zmysel od 40 výletov (Matej 25. 9., nákres). */
const GLOW_AT = 40;
/** Susedia, ktorí sa ukážu aj s nulou — cesta tam je bežná, sprievodca ešte nie. */
const ALWAYS = ['sk', 'cz', 'at', 'pl', 'hu', 'si', 'hr', 'ch'];
const WHEN: Array<[SnifferHeading['when'], string]> = [['now', 'Now'], ['week', 'In a week'], ['summer', 'In summer'], ['date', 'Pick a date']];

const pic = (u?: string | null) => withTransform(u, 'c_fill,g_auto,w_300,h_400,f_auto,q_auto');

const CSS = `
.ss-pass{padding:${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.ss-eb{font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.ss-world{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.ss-ctry{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px ${PACK_SPACE.xs}px ${PACK_SPACE.xs}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${T.border};background:${T.tileBg};cursor:pointer;opacity:.6;font-family:${FONT_UI};text-align:left;}
.ss-ctry img{width:${PACK_SPACE.xl}px;height:${PACK_SPACE.lg}px;object-fit:cover;}
.ss-ctry span{display:flex;flex-direction:column;font-size:${PACK_TEXT.label}px;color:${T.inkStrong};}
.ss-ctry small{font-size:${PACK_TEXT.micro}px;color:${T.inkDim};}
.ss-ctry.is-glow{opacity:1;box-shadow:0 0 0 1px ${T.accentGold}, 0 0 ${PACK_SPACE.md}px ${tintRGBA(T.accentGold, 0.55)};}
.ss-ctry.is-on{opacity:1;${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
.ss-note{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
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
  const [areas, setAreas] = useState<Array<'W' | 'C' | 'E'>>([]);
  const [intent, setIntent] = useState<string | null>(null);
  const [people, setPeople] = useState<SnifferCardData[] | null>(null);

  // Počet výletov podľa krajiny — z katalógu, tým istým pravidlom ako Pútnik (`trailCountry`).
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
    searchPeople(country, areas, intent).then((r) => { if (live) setPeople(r); }).catch(() => { if (live) setPeople([]); });
    return () => { live = false; };
  }, [country, areas, intent]);

  const myIntents: string[] = (human?.intents ?? []).filter((i) => i !== 'community');

  return (
    <>
      <style>{CSS}</style>
      <section className="ss-pass" style={{ ...PACK_BOX.card }}>
        <span className="ss-eb">{tx('pack.sniffer.search.where', 'Where are you heading?')}</span>
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
        <p className="ss-note">{tx('pack.sniffer.search.glowNote', 'Lit up = {n}+ trips with the PILGRIM guide · find a buddy there before you go', { n: GLOW_AT })}</p>
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
      </section>

      <div className="ss-pills">
        {(['W', 'C', 'E'] as const).map((a) => (
          <button key={a} type="button" aria-pressed={areas.includes(a)} className={`pk-pill pk-pill--tap${areas.includes(a) ? ' is-on' : ''}`}
            onClick={() => setAreas((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]))}>{areaLabel(tx, a)}</button>
        ))}
      </div>
      {myIntents.length > 1 && (
        <div className="ss-pills">
          {INTENT_OPTIONS.filter((o) => myIntents.includes(o.value)).map((o) => (
            <button key={o.value} type="button" aria-pressed={intent === o.value}
              className={`pk-pill pk-pill--tap${intent === o.value ? ' is-on' : ''}`}
              onClick={() => setIntent(intent === o.value ? null : o.value)}>{tx(`pack.buddy.intent.${o.value}`, o.labelEN)}</button>
          ))}
        </div>
      )}

      {people && people.length > 0 && (
        <div className="ss-grid">
          {people.map((p) => (
            <button key={p.member} type="button" className="ss-mini" style={{ ...PACK_BOX.row }} onClick={() => onOpen(p)}>
              <img src={pic(p.photos[0] ?? p.dogs[0]?.photo)} alt="" />
              <b>{p.name}{p.age ? `, ${p.age}` : ''}</b>
              <span>{[p.dogs[0]?.name, p.areas?.map((a) => areaLabel(tx, a)).join(', ')].filter(Boolean).join(' · ')}</span>
            </button>
          ))}
        </div>
      )}
      {people && people.length === 0 && (
        <AinubisBubble>{tx('pack.sniffer.search.empty', 'Nobody here yet who fits you both ways. Try another patch or intent.')}</AinubisBubble>
      )}
      <p className="ss-note" style={{ textAlign: 'center' }}>{tx('pack.sniffer.search.mutual', 'You only see people you’re also shown to.')}</p>
    </>
  );
}
