import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
import { WheelYearPicker } from '@/components/WheelDatePicker';
import { DateDropdowns } from '@/components/DateDropdowns';
import { getChineseZodiac, getWesternZodiac } from '@/lib/zodiac';
import { zodiacMap, chineseMap } from '@/components/HeroglyphFrame';
import { LAB } from '@/lib/labTheme';
import { PACK_R } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';

// ════════════════════════════════════════════════════════════════════════════
// „NECHCEM UVIESŤ" — výber znamenia bez dátumu narodenia (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 9. 2026: *„(nechcem uviesť) otvorí popup kde človek vyberie
// znamenie ako máme teraz slajder a len rok) budeme tak krytý a človek nemusi
// uvadzat citlivý udaj"*.
//
// 🔑 PREČO TO NIE JE LEN POHODLIE. Dátum narodenia je osobný údaj, ktorý na nič
//    nepotrebujeme — do heroglyfu ide IBA znamenie. Kto ho nechce dať, vyberie
//    si znamenie sám a rok použije len na čínske zviera.
//
// ⚠️ NA BEŽNEJ CESTE SA DÁTUM UKLADÁ (Matej: *„kto chce nam ho da je to dobre
//    vedieť"*) a cez `selections` ide až do DB. Táto cesta je práve tá druhá:
//    kto ho dať nechce, vyberie znamenie a `OwnerScreen` dátum zahodí.
//
// 🔑 NIE JE TO NOVÁ OBRAZOVKA, JE TO STARÁ. Rad dvanástich znamení aj koliesko
//    rokov sú presne to, čo do 25. 9. stálo na `OwnerZodiacScreen` — tu sú len
//    schované za odkazom, lebo bežná cesta je jeden dátum. Kresby si berie
//    z rámu (`zodiacMap`, `chineseMap`), takže náhľad a slot v heroglyfe sú
//    zaručene tá istá sada.
//
// 🔑 OD 25. 9. 2026 (večer) JE TO CELÉ ZNAMENIE, NIE LEN ÚNIKOVÁ CESTA.
//    Matej: *„kludne mozme znamenie dať celé do popupu kde bude aj info aj výber
//    podla datumu alebo ručne a na hlavný obraz bude uť len výsledok"*. Popup má
//    preto dve polohy: DÁTUM (bežná, s vysvetlením o vinši) a RUČNE (znamenie +
//    rok, pôvodný obsah tohto súboru). MAJITEĽ ukazuje už len výsledok, takže
//    z najplnšej obrazovky vstupu odišli dva riadky.
//
// ⚠️ Rok sám o sebe osobný údaj JE, ale hrubší: z „1990" sa nedá odvodiť deň
//    narodenia. Čínske znamenie sa bez neho spočítať nedá, takže je to minimum,
//    ktoré musíme vypýtať — a keby aj to bolo veľa, človek vyberie rok, ktorý
//    zodpovedá jeho zvieraťu, a my o tom nevieme.
// ════════════════════════════════════════════════════════════════════════════

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] as const;

const MIN_YEAR = 1930;
const DEFAULT_YEAR = 1990;

export interface ZodiacSheetProps {
  open: boolean;
  /** Uložený dátum narodenia — keď ho človek dal, popup sa otvorí na ňom. */
  birthday?: { d: number; m: number; y: number } | null;
  /** Predvyplnené znamenie a rok, keď sa človek do ručného výberu vracia. */
  sign?: string;
  year?: number;
  onClose: () => void;
  /** Potvrdenie dátumom — obe znamenia z neho dopočíta volajúci. */
  onDate: (d: number, m: number, y: number) => void;
  /** Potvrdenie ručne: znamenie (enum po anglicky) + rok pre čínske zviera. */
  onManual: (sign: string, year: number) => void;
}

export function ZodiacSheet({ open, birthday, sign, year, onClose, onDate, onManual }: ZodiacSheetProps) {
  const t = useT();
  /**
   * Poloha popupu. Kto znamenie už má BEZ dátumu, vybral ho ručne — a má sa
   * vrátiť tam, kde ho vybral. Inak sa začína dátumom (bežná cesta).
   */
  const [mode, setMode] = useState<'date' | 'manual'>('date');
  const [pick, setPick] = useState<string | null>(sign || null);
  const [yr, setYr] = useState<number>(year || DEFAULT_YEAR);
  const [bd, setBd] = useState<{ d: number; m: number; y: number } | null>(birthday || null);

  // Otvorenie je ŠTART, nie stav: kto popup zavrie a otvorí znova, má vidieť
  // to, čo je uložené — nie to, čo naklikal a zahodil.
  useEffect(() => {
    if (!open) return;
    setMode(!birthday && sign ? 'manual' : 'date');
    setPick(sign || null);
    setYr(year || DEFAULT_YEAR);
    setBd(birthday || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /**
   * Zviera sa ukazuje VŽDY, aj kým človek kolesom nepohol — pod kolesom stojí
   * to, čo z neho práve vyjde, takže predvolený rok nie je tajomstvo.
   * ⚠️ HOTOVO preto drží len ZNAMENIE. Zamykať ho na „dotkol sa kolesa" je tá
   *    istá pasca, akú má krok 2 s predvyplneným dátumom: tlačidlo je mŕtve a
   *    nepovie prečo.
   */
  const chinese = getChineseZodiac(yr);
  /** Náhľad z dátumu — tie isté dve značky, aké potom pristanú v ráme. */
  const fromDate = bd
    ? { west: getWesternZodiac(bd.m, bd.d).name, chin: getChineseZodiac(bd.y).name }
    : null;
  const canDone = mode === 'date' ? !!bd : !!pick;
  const done = () => {
    if (!canDone) return;
    if (mode === 'date') onDate(bd!.d, bd!.m, bd!.y);
    else onManual(pick!, yr);
  };
  const today = new Date();

  if (!open) return null;

  return createPortal(
    <div className="zs-root" role="dialog" aria-modal="true">
      <div className="zs-backdrop" onClick={onClose} />
      <div className="zs-card">
        <button type="button" className="zs-close" aria-label={t('nav.aria.close')} onClick={onClose}>✕</button>
        {mode === 'date' ? (
          <>
            {/* ── DÁTUM (bežná cesta) ─────────────────────────────────────
                Vlys = tá istá veta, akú mala obrazovka (Matej 25. 9.: *„čo
                o tebe hovoria hviezdy"*), pod ním vysvetlenie o vinši. */}
            <p className="zs-title">{t('heroglyph.flow.ownerZodiac.question')}</p>
            <p className="zs-hint">{t('heroglyph.flow.owner.signsHint')}</p>
            <DateDropdowns
              day={bd?.d ?? 1}
              month={bd?.m ?? 1}
              year={bd?.y ?? DEFAULT_YEAR}
              empty={!bd}
              emptyLabels={{
                day: t('heroglyph.flow.dogs.phDay'),
                month: t('heroglyph.flow.dogs.phMonth'),
                year: t('heroglyph.flow.dogs.phYear'),
              }}
              minYear={MIN_YEAR}
              maxYear={today.getFullYear()}
              maxDate={today}
              skin="pale"
              onChange={(d, m, y) => setBd({ d, m, y })}
            />
            {/* Výsledok hneď pod dátumom — dve značky a ich mená. Kým dátum
                nie je celý, stoja prázdne jamky, aby karta pri výbere
                nepodskočila. */}
            <div className="zs-result">
              <span className={`zs-mark sm${fromDate ? ' on' : ''}`}>
                {fromDate ? <img src={zodiacMap[fromDate.west]} alt="" /> : <i>?</i>}
              </span>
              <span className={`zs-mark sm${fromDate ? ' on' : ''}`}>
                {fromDate ? <img src={chineseMap[fromDate.chin]} alt="" /> : <i>?</i>}
              </span>
              <span className="zs-said">
                {fromDate
                  ? `${t(`heroglyph.flow.ownerZodiac.sign.${fromDate.west}`)} · ${t(`heroglyph.flow.ownerZodiac.animal.${fromDate.chin}`)}`
                  : '—'}
              </span>
            </div>
            <button type="button" className="zs-switch" onClick={() => setMode('manual')}>
              {t('heroglyph.flow.owner.optOut')}
            </button>
          </>
        ) : (
          <>
            <p className="zs-title">{t('heroglyph.flow.owner.sheetTitle')}</p>

            {/* Rad dvanástich — mriežka, nie posuvný pás: dvanásť je málo na to,
                aby sa muselo rolovať, a v mriežke je vidieť všetky naraz. */}
            <div className="zs-grid">
              {SIGNS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`zs-sign${pick === s ? ' on' : ''}`}
                  aria-pressed={pick === s}
                  onClick={() => setPick(s)}
                >
                  <img src={zodiacMap[s]} alt="" />
                  <span>{t(`heroglyph.flow.ownerZodiac.sign.${s}`)}</span>
                </button>
              ))}
            </div>

            <p className="zs-legend">{t('heroglyph.flow.owner.sheetYear')}</p>
            <div className="zs-year">
              <div className="zs-wheel">
                <WheelYearPicker year={yr} minYear={MIN_YEAR} maxYear={today.getFullYear()}
                  onChange={setYr} />
              </div>
              <span className="zs-mark on">
                <img src={chineseMap[chinese.name]} alt={t(`heroglyph.flow.ownerZodiac.animal.${chinese.name}`)} />
              </span>
            </div>
            <button type="button" className="zs-switch" onClick={() => setMode('date')}>
              {t('heroglyph.flow.owner.byDate')}
            </button>
          </>
        )}

        <button type="button" className="zs-done" disabled={!canDone} onClick={done}>
          {t('heroglyph.flow.message.done')}
        </button>
      </div>

      <style>{ZODIAC_SHEET_CSS}</style>
    </div>,
    document.body,
  );
}

/** Šat popupu. Materiál je papyrus vstupu — popup je jeho časť, nie cudzia karta. */
const ZODIAC_SHEET_CSS = `
.zs-root {
  position: fixed; inset: 0; z-index: 2100;
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.zs-backdrop {
  position: absolute; inset: 0; background: rgba(0, 0, 0, 0.72);
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
}
.zs-card {
  position: relative; z-index: 1; width: 100%; max-width: 420px;
  max-height: calc(100dvh - 32px); overflow-y: auto;
  background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
  border: 1.5px solid rgba(201, 154, 63, 0.55); border-radius: ${PACK_R.card}px;
  padding: 20px 16px 16px; box-shadow: 0 20px 64px rgba(0, 0, 0, 0.65);
  display: flex; flex-direction: column; gap: 12px;
}
.zs-close {
  position: absolute; top: 10px; right: 12px; padding: 4px; cursor: pointer;
  background: none; border: none; font-size: 14px; line-height: 1; color: rgba(0, 0, 0, 0.4);
}
.zs-title {
  margin: 0; padding: 0 20px; text-align: center;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px;
  color: ${LAB.goldInk};
}
/* Štyri v rade — dvanásť znamení vyjde na tri riadky a karta sa nemusí rolovať. */
.zs-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.zs-sign {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 2px; cursor: pointer; border-radius: ${PACK_R.tile}px;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid rgba(179, 130, 45, 0.55);
}
.zs-sign img { width: 30px; height: 30px; object-fit: contain; }
.zs-sign span {
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 9px;
  letter-spacing: 0.02em; text-transform: uppercase; color: ${LAB.inkSoft};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
}
/* Vybrané svieti lapisom — tá istá reč ako voľba v celom vstupe. */
/* 🔴 Bola tu cudzia modrá #2F6BFF (Matej 25. 9. 2026: *„úplne iné farby než brand!"*) —
   odteraz tokeny \`LAPIS\`, tá istá voľba ako v celom vstupe. */
.zs-sign.on { border-color: ${LAPIS.edge}; background: ${LAPIS.fill}; }
.zs-sign.on span { color: ${LAPIS.edge}; }

.zs-legend {
  margin: 4px 0 0; text-align: center;
  font-family: 'Space Grotesk', sans-serif; font-size: 10px;
  letter-spacing: 0.22em; text-transform: uppercase; color: ${LAB.inkMuted};
}
.zs-year { display: flex; align-items: center; gap: 12px; }
.zs-wheel { flex: 1 1 auto; min-width: 0; }
.zs-mark {
  flex: none; width: 56px; height: 56px; display: grid; place-items: center;
  border-radius: ${PACK_R.tile}px; border: 1.5px solid rgba(179, 130, 45, 0.55);
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.65), rgba(242, 226, 189, 0.5));
}
.zs-mark.on { border-color: ${LAPIS.edge}; }
.zs-mark img { width: 38px; height: 38px; object-fit: contain; }
.zs-mark i { font-style: normal; font-family: 'Cinzel', serif; font-size: 20px; color: ${LAB.inkMuted}; }

.zs-hint {
  margin: -4px 0 0; text-align: center;
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.4;
  color: ${LAB.inkSoft};
}
.zs-result { display: flex; align-items: center; justify-content: center; gap: 8px; }
.zs-mark.sm { width: 40px; height: 40px; }
.zs-mark.sm img { width: 28px; height: 28px; }
.zs-said {
  margin-left: 4px;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.06em; text-transform: uppercase; color: ${LAB.inkSoft};
}
/* 🔵 Prepnutie polohy je AKCIA vnútri karty — lapisový podčiarknutý text,
   nie druhé tlačidlo. Plná plocha patrí len HOTOVO. */
.zs-switch {
  align-self: center; padding: 4px; border: none; background: none; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; font-size: 12px;
  color: ${LAPIS.edge}; text-decoration: underline; text-underline-offset: 2px;
}

.zs-done {
  width: 100%; height: 44px; border: none; border-radius: ${PACK_R.field}px; cursor: pointer;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 13px;
  letter-spacing: 0.12em; text-transform: uppercase; color: ${LAPIS.ink};
  background: ${LAPIS.grad};
  box-shadow: ${LAPIS_BTN_SHADOW};
}
.zs-done:hover:not(:disabled) { background: ${LAPIS.gradHover}; }
.zs-done:disabled {
  cursor: default; color: ${LAB.inkMuted}; box-shadow: none;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid ${LAB.hairline};
}
`;
