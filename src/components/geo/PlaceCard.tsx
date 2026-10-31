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
import { PACK_THEME as T, PACK_R, PACK_SPACE as S, PACK_TEXT as TX, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { intlLocale } from '@/i18n/bcp47';
import { useLang } from '@/i18n/LanguageContext';
import { FONT_EMOJI, sleepEmoji } from '@/components/pack/mapnotes/markEmoji';
import { SLEEP_CHIPS } from '@/components/pack/sleepChips';
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
  const { lang } = useLang();

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
        {elevM != null && <div className="pcard-meta">{tx('pack.place.elev', { m: elevM.toLocaleString(intlLocale(lang)) })}</div>}

        {spot ? (
          <>
            {chips.length > 0 && (
              <div className="pcard-chips">
                {chips.map((c) => (
                  <span key={c!.id} className="pcard-chip">
                    <i style={{ fontFamily: FONT_EMOJI }}>{c!.emoji}</i>{tx(`pack.place.chip.${c!.id}`)}
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
   dvojriadkový názov útulne ešte zmestí bez delenia slov.
   BLEDÝ ŠAT (31. 10. 2026): Matej chcel miesta na mape „v bledom šate"; šuplík miest to dostal,
   ostatné body (lavička, sedlo…) ostali v tmavej bubline — tá istá mapa, dva šaty. Teraz papyrus. */
.pcard{width:260px;font-family:${FONT_UI};color:${T.inkStrong};}
.pcard-photo{display:block;width:100%;height:132px;object-fit:cover;border-radius:${PACK_R.tile}px ${PACK_R.tile}px 0 0;}
.pcard-body{padding:${S.md}px;display:flex;flex-direction:column;gap:${S.xs}px;}
.pcard-kind{display:flex;align-items:center;gap:${S.xs}px;font-size:${TX.micro}px;font-weight:600;
  letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.pcard-kind i{font-style:normal;font-size:${TX.label}px;line-height:1;letter-spacing:0;}
.pcard-name{font-family:${FONT_TITLE};font-weight:700;font-size:${TX.body}px;line-height:1.25; /* písmo: meno */
  letter-spacing:.02em;color:${T.inkStrong};}
.pcard-meta{font-size:${TX.label}px;color:${T.inkWarm};}
.pcard-chips{display:flex;flex-wrap:wrap;gap:${S.xs}px;margin-top:${S.xs}px;}
.pcard-chip{display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;
  background:#FFFDF7;border:1px solid ${T.hairline};font-size:${TX.label}px;color:${T.inkStrong};white-space:nowrap;}
.pcard-chip i{font-style:normal;line-height:1;}
.pcard-text{margin:${S.xs}px 0 0;font-size:${TX.label}px;line-height:1.45;color:${T.inkStrong};
  display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;}
.pcard-by{margin-top:${S.xs}px;display:flex;align-items:center;gap:${S.xs}px;font-size:${TX.label}px;color:${T.inkWarm};}
.pcard-by b{font-weight:600;color:${T.cardEdge};}
.pcard-empty{margin:${S.xs}px 0 0;font-size:${TX.label}px;line-height:1.4;color:${T.inkWarm};}
`;
