import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
import { WheelYearPicker } from '@/components/WheelDatePicker';
import { getChineseZodiac } from '@/lib/zodiac';
import { zodiacMap, chineseMap } from '@/components/HeroglyphFrame';
import { LAB } from '@/lib/labTheme';
import { PACK_R } from '@/components/pack/packTheme';

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
// 🔴 DÁTUM NEIDE DO DB ANI NA BEŽNEJ CESTE. `PaymentScreen` posiela celý objekt
//    `selections` do `create-checkout`, takže dátum by sa v nej uložil — preto
//    ho `OwnerScreen` drží v `sessionStorage` a do store zapisuje len znamenia.
//    Táto cesta ho navyše po výbere zahodí úplne.
//
// 🔑 NIE JE TO NOVÁ OBRAZOVKA, JE TO STARÁ. Rad dvanástich znamení aj koliesko
//    rokov sú presne to, čo do 25. 9. stálo na `OwnerZodiacScreen` — tu sú len
//    schované za odkazom, lebo bežná cesta je jeden dátum. Kresby si berie
//    z rámu (`zodiacMap`, `chineseMap`), takže náhľad a slot v heroglyfe sú
//    zaručene tá istá sada.
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
  /** Predvyplnené znamenie a rok, keď sa človek do výberu vracia. */
  sign?: string;
  year?: number;
  onClose: () => void;
  /** Potvrdenie: znamenie (enum po anglicky) + rok pre čínske zviera. */
  onDone: (sign: string, year: number) => void;
}

export function ZodiacSheet({ open, sign, year, onClose, onDone }: ZodiacSheetProps) {
  const t = useT();
  const [pick, setPick] = useState<string | null>(sign || null);
  const [yr, setYr] = useState<number>(year || DEFAULT_YEAR);

  // Otvorenie je ŠTART, nie stav: kto popup zavrie a otvorí znova, má vidieť
  // to, čo je uložené — nie to, čo naklikal a zahodil.
  useEffect(() => {
    if (!open) return;
    setPick(sign || null);
    setYr(year || DEFAULT_YEAR);
  }, [open, sign, year]);

  /**
   * Zviera sa ukazuje VŽDY, aj kým človek kolesom nepohol — pod kolesom stojí
   * to, čo z neho práve vyjde, takže predvolený rok nie je tajomstvo.
   * ⚠️ HOTOVO preto drží len ZNAMENIE. Zamykať ho na „dotkol sa kolesa" je tá
   *    istá pasca, akú má krok 2 s predvyplneným dátumom: tlačidlo je mŕtve a
   *    nepovie prečo.
   */
  const chinese = getChineseZodiac(yr);
  const canDone = !!pick;

  if (!open) return null;

  return createPortal(
    <div className="zs-root" role="dialog" aria-modal="true">
      <div className="zs-backdrop" onClick={onClose} />
      <div className="zs-card">
        <button type="button" className="zs-close" aria-label={t('nav.aria.close')} onClick={onClose}>✕</button>
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
            <WheelYearPicker year={yr} minYear={MIN_YEAR} maxYear={new Date().getFullYear()}
              onChange={setYr} />
          </div>
          <span className="zs-mark on">
            <img src={chineseMap[chinese.name]} alt={t(`heroglyph.flow.ownerZodiac.animal.${chinese.name}`)} />
          </span>
        </div>

        <button type="button" className="zs-done" disabled={!canDone}
          onClick={() => canDone && onDone(pick!, yr)}>
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
.zs-sign.on { border-color: #2F6BFF; background: rgba(47, 107, 255, 0.10); }
.zs-sign.on span { color: #16307A; }

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
.zs-mark.on { border-color: #2F6BFF; }
.zs-mark img { width: 38px; height: 38px; object-fit: contain; }
.zs-mark i { font-style: normal; font-family: 'Cinzel', serif; font-size: 20px; color: ${LAB.inkMuted}; }

.zs-done {
  width: 100%; height: 44px; border: none; border-radius: ${PACK_R.field}px; cursor: pointer;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 13px;
  letter-spacing: 0.12em; text-transform: uppercase; color: #FDF7E7;
  background: linear-gradient(135deg, #2F6BFF 0%, #1B3FA8 100%);
  box-shadow: 0 4px 14px rgba(20, 50, 90, 0.35);
}
.zs-done:disabled {
  cursor: default; color: ${LAB.inkMuted}; box-shadow: none;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid ${LAB.hairline};
}
`;
