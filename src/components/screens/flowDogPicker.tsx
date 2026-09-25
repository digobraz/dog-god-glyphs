import { useMemo } from 'react';
import { useDogyptStore, MAIN_DOG_ID } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';

// ════════════════════════════════════════════════════════════════════════════
// KTORÉHO PSA PRÁVE OPISUJEM — jeden riadok pre celý vstup (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 9. 2026: *„v hero labe od kroku 6 neriešime multipsov! musíme to
// opraviť!"*.
//
// 🔴 ČO BOLO ZLE. Krok 5 (PODSTATA) prepínač psov má a píše do
//    `dogEssence[idPsa]`, ale kroky 6 (PATRÓN) a 8 (POVAHA) o druhom psovi
//    nevedeli nič: patrón aj povaha sa zapisovali do `selections`, teda VŽDY
//    prvému psovi. Kto si v kroku 3 nahodil troch psov, vybral podstatu
//    trikrát a potom jedného patróna — a nemal ako zistiť, komu pripadol.
//
// 🔑 PREČO SPOLOČNÝ SÚBOR A NIE KÓPIA. Riadok (fotka · meno · ✓ · šípky) a
//    zoznam psov v poradí z kroku 3 by inak stáli TRIKRÁT. Text sa z
//    `EssenceScreen` PRESUNUL, neprepísal sa — triedy `.es-*` sa premenovali na
//    `.fdh-*`, hodnoty sú tie isté.
//
// ⚠️ MAJITEĽ (krok 8) prepínač MÁ, ale LEN NA PREZERANIE (25. 9. večer).
//    Účet je majiteľov a jeden človek nesie celú svorku, takže sa nič
//    nevypĺňa znova — prepína sa, ČÍ heroglyf vidím (psia časť + poradie).
//    Dovtedy tu stálo „prepínač NEDOSTÁVA"; Matej: *„u každého psa bude mať
//    iný heroglyf"*.
// ════════════════════════════════════════════════════════════════════════════

export type FlowDog = { id: string; name: string; photo: string | null };

/**
 * Psi v poradí, v akom ich človek zoradil v kroku 3 — prvý pes stojí na
 * `mainDogPos`, nie vždy na začiatku (`DogsScreen` ho vie presunúť).
 *
 * ⚠️ Poradie sa NERADÍ ZNOVA. Pes na rade musí byť ten istý, ktorého človek
 *    videl prvého v zozname; druhé triedenie by obrazovky rozišlo medzi sebou.
 */
export function useFlowDogs(): FlowDog[] {
  const dogName = useDogyptStore((s) => s.dogName);
  const dogPhotoUrl = useDogyptStore((s) => s.dogPhotoUrl);
  const extraDogs = useDogyptStore((s) => s.extraDogs);
  const mainDogPos = useDogyptStore((s) => s.mainDogPos);

  return useMemo(() => {
    const rest = extraDogs.map((d) => ({ id: d.id, name: d.name, photo: d.photoUrl }));
    const main = { id: MAIN_DOG_ID, name: dogName, photo: dogPhotoUrl || null };
    const at = Math.max(0, Math.min(mainDogPos, rest.length));
    return [...rest.slice(0, at), main, ...rest.slice(at)];
  }, [extraDogs, dogName, dogPhotoUrl, mainDogPos]);
}

export interface FlowDogHeaderProps {
  dogs: FlowDog[];
  /** Index psa na rade. */
  cur: number;
  /** Prepnutie na iného psa (index). Šípky sa ukážu len pri dvoch a viac. */
  onGo: (i: number) => void;
  /** Má ten pes na TEJTO obrazovke hotovo? Vykreslí ✓ za menom. */
  done?: boolean;
  /** Geometria riadka patrí obrazovke; sem chodí len to, čo ju mení. */
  className?: string;
}

/**
 * Riadok „koho práve opisujem". Pri jedinom psovi sú to len fotka a meno —
 * šípky by nemali čo prepínať a riadok by vyzeral ako pokazený ovládač.
 */
export function FlowDogHeader({ dogs, cur, onGo, done, className = '' }: FlowDogHeaderProps) {
  const t = useT();
  const dog = dogs[Math.min(cur, Math.max(0, dogs.length - 1))];

  return (
    <div className={`fdh-row ${className}`}>
      {dog?.photo
        ? <img className="fdh-photo" src={dog.photo} alt={dog?.name || ''} />
        : (
          <span className="fdh-photo fdh-photo--empty">
            {(dog?.name || '?').slice(0, 1)}
          </span>
        )}
      <span className="fdh-name">
        {dog?.name || t('heroglyph.flow.yourDogFallback')}
        {done && <i className="fdh-ok">✓</i>}
      </span>
      {dogs.length > 1 && (
        <div className="fdh-switch">
          <button
            type="button"
            className="fdh-arrow"
            // ⚠️ Vlastný kľúč si nezakladám — `whatNext.prev/next` je preložené
            //    v 18 jazykoch a znamená presne toto.
            aria-label={t('whatNext.prev')}
            onClick={() => onGo((cur - 1 + dogs.length) % dogs.length)}
          >‹</button>
          <em>{cur + 1}/{dogs.length}</em>
          <button
            type="button"
            className="fdh-arrow"
            aria-label={t('whatNext.next')}
            onClick={() => onGo((cur + 1) % dogs.length)}
          >›</button>
        </div>
      )}
    </div>
  );
}

/**
 * Šat riadka. **Presunuté z `ESSENCE_CSS`, nie napísané znovu** — odôvodnenia
 * nižšie sú pôvodné Matejove rozhodnutia z 24. 9. 2026.
 */
export const FLOW_DOG_CSS = `
/* 🔴 FOTKA + MENO STOJA V STREDE BLOKU (Matej 24. 9., piate kolo: *„foto a meno
   psa by som centroval do stredu bloku takto vedľa seba = posuň to doprava aby
   obsah toho riadku bol na strede"*). Dovtedy boli zarovnané doľava a meno
   naťahovalo zvyšok riadka.
   🔑 Prečo MRIEŽKA a nie \`justify-content: center\`: prepínač psov sa musí držať
   pravého kraja, a ten by dvojicu odtlačil doľava — stred by potom platil len
   pri jedinom psovi. Dva prázdne \`1fr\` stĺpce po krajoch sú vždy rovnaké, takže
   dvojica stojí na strede BLOKU, nie na strede zvyšku po prepínači.
   ⚠️ Preto sa prepínač nesmie prepnúť na \`position: absolute\` — pri dlhom mene
   by sa naň meno nasunulo. Mriežka mu miesto vyhradí. */
.fdh-row {
  display: grid; grid-template-columns: 1fr auto auto 1fr;
  align-items: center; gap: 10px; width: 100%;
}
.fdh-row .fdh-photo { grid-column: 2; }
/* Meno nerastie ani nekrčí susedov — šírku si berie podľa textu a pri dlhom mene
   ustúpi písmom (pravidlo nižšie), nie ellipsis. */
.fdh-row .fdh-name { grid-column: 3; justify-self: start; min-width: 0; }
.fdh-row .fdh-switch { grid-column: 4; justify-self: end; flex: 0 0 auto; }
/* Pri dlhom mene ustúpi PÍSMO, nie posledné písmená — ellipsis v mene psa je
   to najhoršie, čo môže na tejto obrazovke stáť. */
@media (max-width: 420px) { .fdh-row .fdh-name { font-size: 15px; } }
/* Nízke okno (Matejovo PC aj iPhone SE): riadok ustúpi ešte o kúsok — je to
   hlavička, nie ovládací prvok, takže sa zmenšuje ako prvý. */
@media (max-height: 820px) {
  .fdh-photo { width: 36px; height: 36px; }
  .fdh-row .fdh-name { font-size: 15px; }
  .fdh-arrow { width: 30px; height: 30px; font-size: 16px; }
}

/* ⚠️ 40 px, nie 48 (Matej 25. 9.: *„kludne zmenši na pc foto konkretneho psa aj
   meno je celkom velke može to pomoct"*). Riadok stojí na štyroch obrazovkách,
   takže každý ušetrený pixel sa počíta štyrikrát — a práve výška bola dôvod,
   prečo obsah na jeho okne nemal okraje. */
.fdh-photo {
  width: 40px; height: 40px; border-radius: 999px; object-fit: cover; flex: none;
  display: grid; place-items: center;
  /* Vlások, nie obruč: fotka má byť FOTKA. Cloisonné rám ostáva Hektorovi, aby
     bolo na prvý pohľad jasné, kto sa pýta a kto je tvoj pes. */
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  box-shadow: 0 1px 3px rgba(60, 40, 10, 0.22);
}
.fdh-photo--empty {
  background: radial-gradient(circle at 50% 35%, #F7ECD2 0%, #E8D5AA 100%);
  font-family: 'Cinzel', serif; font-size: 22px; color: #8a5a14;
}
/* Meno psa = Cinzel Decorative (brand lock: mená psov na oficiálnych povrchoch). */
.fdh-name {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Cinzel Decorative', 'Cinzel', serif; font-weight: 700;
  font-size: 17px; letter-spacing: 0.04em; line-height: 1.1;
  color: rgba(35, 22, 8, 0.90); text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
  text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.fdh-ok { font-style: normal; font-size: 12px; color: #2E5C3B; }

/* ── PREPÍNAČ PSOV ─────────────────────────────────────────────────────────
   Šípky a počítadlo vedľa mena. Meno nesie riadok sám, takže v prepínači už
   druhýkrát nie je — inak stojí to isté slovo dvakrát vedľa seba. */
.fdh-switch { display: flex; align-items: center; justify-content: center; gap: 10px; }
.fdh-switch em {
  font-family: 'Space Grotesk', sans-serif; font-style: normal; font-size: 12px;
  letter-spacing: 0.10em; color: rgba(60, 40, 12, 0.52);
}
.fdh-arrow {
  flex: none; width: 34px; height: 34px; border-radius: 999px; cursor: pointer;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 252, 240, 0.85), 0 1px 2px rgba(60, 40, 10, 0.10);
  font-family: 'Cinzel', serif; font-size: 18px; line-height: 1; color: #8a5a14;
}

/* Rytina pod riadkom = tá istá drážka ako vlysy pri nadpise: tmavá hrana a
   svetlá pod ňou. Jedna šedá linka by bola čiara v tabuľke, nie zásah do plochy. */
.fdh-rule {
  display: block; width: 100%; height: 2px; border-radius: 1px; flex: none;
  background: linear-gradient(180deg,
    rgba(120, 86, 26, 0.34) 0 1px,
    rgba(255, 252, 240, 0.72) 1px 2px);
}
`;
