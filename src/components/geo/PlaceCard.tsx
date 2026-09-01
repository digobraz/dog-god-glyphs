// ============================================================================
// KARTA MIESTA — obsah bubliny nad bodom zo sveta.
//
// Matej 2026-08-27, keď mu bublina nad Ďurkovou vysypala meno po písmenách pod seba:
// „aha ako to hádže... potrebujeme tomu vytvoriť krázny náhľad názov kartu kde bude fotka
// názov hodnotenie a komentár a viac info" + „aha ako to majú mapy CZ inšpirujme sa".
//
// ── PREČO SA TÁ BUBLINA ROZSYPALA ───────────────────────────────────────────
// `.leaflet-popup-content` mal `width:auto!important` + `min-width:0`, a text v ňom
// `word-break:break-word`. Zmršťovanie na obsah + lámanie v strede slova = najmenšia možná
// šírka je JEDNO PÍSMENO. Krátke mená sa vošli, „Ďurková v prípade naplnenia kapacity
// útulne" nie — preto to vyzeralo ako náhodná chyba. Bublina značiek svorky to nemá, lebo
// má `min-width:190px`. Karta preto stojí na PEVNEJ šírke, nie na zmršťovaní.
//
// ── DVA STAVY, JEDNA KARTA ──────────────────────────────────────────────────
// A) BOD ZO SVETA — všetko, čo o ňom vieme, je z OSM: druh, meno, výška. Karta to povie
//    nahlas („ešte nikto z Dogypťanov nič nenapísal") namiesto toho, aby predstierala
//    prázdny profil.
// B) PREVZATÉ MIESTO — niekto zo svorky ho popísal: fotka, chipy, text, podpis.
// Rozdiel nesie `spot`, nie druhá karta: dve karty pre to isté miesto by sa rozišli pri
// prvej zmene (tá istá lekcia ako `circleMark.ts`).
//
// ⚠️ ČO TU ZATIAĽ NIE JE A PREČO: hodnotenie labkami, počet Dogypťanov, ktorí tu boli, a
// tlačidlá „Bol som tu / Chystám sa". Všetky tri stoja na zápise návštevy, ktorý ešte
// nestojí — a tlačidlo bez cieľa je horšie než chýbajúce tlačidlo (klik nespraví nič a
// človek to skúsi znova). Karta má na ne miesto v spodnom rade, doplnia sa spolu s formulárom.
// ============================================================================
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { FONT_EMOJI, sleepEmoji } from '@/components/pack/mapnotes/markEmoji';
import { SLEEP_CHIPS } from '@/components/pack/sleepChips';
import { SLEEP_WILD_WARNING_KEY } from './sleepSpots';
import type { SleepSpot } from './sleepSpotsData';

const CHIP_BY_ID = new Map(SLEEP_CHIPS.map((c) => [c.id, c]));

export interface PlaceCardProps {
  /** typ bodu v dlaždici (`sleep_hut`, `spring`, …) — nesie emoji */
  poiType: string;
  /** preložený názov druhu (`pack.sleep.hut` / `pack.poi.spring`) */
  kindLabel: string;
  /** meno z OSM; bezmenných bodov je v dlaždiciach väčšina */
  name?: string;
  /** nadmorská výška z DEM, upečená do dlaždíc (`compute-sleep-elev.py`) */
  elevM?: number;
  /** prevzaté miesto, ak sa v okolí našlo — inak stav A */
  spot?: SleepSpot | null;
  /**
   * `tx()` volajúceho; karta si prekladač nedrží, aby fungovala aj mimo `/pack`.
   *
   * ⚠️ Podpis je ZHODNÝ s `TFunction` z `LanguageContext` — druhý parameter sú
   *    PREMENNÉ NA DOSADENIE, nie fallback. Pôvodne tu stálo `fallback?: string`
   *    a `useT()` sa doň nedal priradiť (TS2322). Fallback by aj tak nefungoval:
   *    `t()` vracia pri chýbajúcom kľúči SAMOTNÝ KĽÚČ, reťazec v druhom parametri
   *    ignoruje. Chýbajúci preklad rieši `en.ts`, nie text na volajúcom mieste.
   */
  tx: (key: string, vars?: Record<string, string | number>) => string;
}

export function PlaceCard({ poiType, kindLabel, name, elevM, spot, tx }: PlaceCardProps) {
  const isSleep = poiType.startsWith('sleep_');
  const emoji = isSleep ? sleepEmoji(poiType) : '';
  const title = spot?.name || name;
  const chips = (spot?.chips ?? []).map((id) => CHIP_BY_ID.get(id)).filter(Boolean);
  const isWild = (spot?.kind ?? (isSleep ? poiType.slice(6) : '')) === 'wild';

  return (
    <div className="pcard">
      {spot?.photoUrl && (
        /* Fotka je REKVIZITA MIESTA, nie ozdoba karty — preto hore a cez celú šírku,
           rovnako ako na karte výletu a v paneli mapy.cz. `loading="lazy"`: bublín sa
           za jedno posedenie otvorí veľa a väčšina fotiek sa nikdy nepozrie. */
        <img className="pcard-photo" src={spot.photoUrl} alt="" loading="lazy" />
      )}
      <div className="pcard-body">
        <div className="pcard-kind">
          {emoji && <i style={{ fontFamily: FONT_EMOJI }}>{emoji}</i>}
          {kindLabel}
        </div>
        {title && <div className="pcard-name">{title}</div>}
        {elevM != null && <div className="pcard-meta">{elevM.toLocaleString('sk-SK')} m n. m.</div>}

        {isWild && <div className="pcard-warn">{tx(SLEEP_WILD_WARNING_KEY)}</div>}

        {spot ? (
          <>
            {chips.length > 0 && (
              <div className="pcard-chips">
                {chips.map((c) => (
                  <span key={c!.id} className="pcard-chip">
                    <i style={{ fontFamily: FONT_EMOJI }}>{c!.emoji}</i>{c!.label}
                  </span>
                ))}
              </div>
            )}
            {spot.body && <p className="pcard-text">{spot.body}</p>}
            {(spot.authorFirst || spot.packNumber != null) && (
              <div className="pcard-by">
                {spot.authorFirst || '—'}
                {spot.packNumber != null && <b>#{spot.packNumber}</b>}
              </div>
            )}
          </>
        ) : (
          <p className="pcard-empty">
            {/* EN v `en.ts`: „Nobody from the pack has written about this place yet." */}
            {tx('pack.sleep.untouched')}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * CSS karty. Injektuje ju `PoiLayer` spolu s CSS bubliny — karta sa kreslí len tam.
 *
 * ⚠️ JS template literal: spätný apostrof v komentári ho ukončí a stránka spadne
 * na „... is not a function". Stráži to `npm run check:css`.
 */
export const PLACE_CARD_CSS = `
/* PEVNÁ ŠÍRKA, NIE ZMRŠŤOVANIE — dôvod je v hlavičke súboru. 260 px je šírka, pri ktorej sa
   dvojriadkový názov útulne ešte zmestí bez delenia slov. */
.pcard{width:260px;font-family:${FONT_UI};}
.pcard-photo{display:block;width:100%;height:132px;object-fit:cover;border-radius:9px 9px 0 0;}
.pcard-body{padding:10px 12px 11px;display:flex;flex-direction:column;gap:4px;}
/* Eyebrow = druh. Space Grotesk 600, zlatá — ten istý vzor ako ".religion-eyebrow". */
.pcard-kind{display:flex;align-items:center;gap:5px;font-size:9.5px;font-weight:600;
  letter-spacing:.18em;text-transform:uppercase;color:${T.cardEdge};}
.pcard-kind i{font-style:normal;font-size:12px;line-height:1;}
/* Meno miesta = Cinzel, ako názov výletu na karte. Nie je to údaj, je to identita miesta. */
.pcard-name{font-family:${FONT_TITLE};font-weight:700;font-size:14px;line-height:1.25;
  letter-spacing:.02em;color:#F3E9DA;}
.pcard-meta{font-size:11.5px;color:rgba(245,240,228,0.62);}
.pcard-warn{margin-top:4px;font-size:11px;line-height:1.35;color:#E8A87C;}
.pcard-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;}
.pcard-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 7px;border-radius:999px;
  background:rgba(201,154,63,0.14);border:1px solid rgba(201,154,63,0.34);
  font-size:10.5px;color:rgba(245,240,228,0.88);white-space:nowrap;}
.pcard-chip i{font-style:normal;font-size:11px;line-height:1;}
/* Popis sa NELÁME v strede slova (to bola pôvodná chyba) a je zastrihnutý na štyri riadky —
   celý text patrí na profil miesta, bublina je náhľad. */
.pcard-text{margin:7px 0 0;font-size:12px;line-height:1.45;color:rgba(245,240,228,0.90);
  display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;}
.pcard-by{margin-top:7px;display:flex;align-items:center;gap:6px;font-size:11px;
  color:rgba(245,240,228,0.55);}
.pcard-by b{font-weight:600;color:${T.cardEdge};}
.pcard-empty{margin:7px 0 0;font-size:11.5px;line-height:1.4;color:rgba(245,240,228,0.58);}
`;
