import { useState } from 'react';
import { motion } from 'framer-motion';
import { DateDropdowns } from '@/components/DateDropdowns';
import legendIconUrl from '@/assets/legend-icon.svg';
import angelIconUrl from '@/assets/angel-icon.svg';
import { PICK_INK } from '@/components/pack/navGoldSkin';
import { useT } from '@/i18n/LanguageContext';

// ════════════════════════════════════════════════════════════════════════════
// „ŽIJE TVOJ PES?" — VOĽBA A DÁTUM ODCHODU (23. 9. 2026)
//
// Matej: *„žijúca legenda a psí anjel vyzerajú nezáživne, tie tlačítka musia byť
// krajšie a musí byť vidno ktoré sú označené, ak klikne na psí anjel je treba
// vysunúť popup a napísať dátum úmrtia"*.
//
// 🔴 NEVYMÝŠĽA SA TU NIČ NOVÉ. Presne toto už stálo v `IntroScreen` — ikonky
//    z kitu aj popup s dátumom. Do `NameScreen` sa zdedili len HOLÉ TEXTOVÉ
//    tlačidlá, lebo otázka sa sem sťahovala narýchlo. Tvar sa teda vracia,
//    nie objavuje.
//
// ⚠️ VÝBER JE LAPIS, NIE FIALOVÁ. `IntroScreen` používa `is-selected-purple` —
//    predlaunchový štýl. Fialová má od 23. 8. jediný význam (VÝLETY,
//    `PACK_THEME.tripPurple`) a „moja voľba" je lapis (CLAUDE.md, brand v3.2).
//    Výplň je priesvitný TINT, nie plná plocha: plná farba patrí jedinému
//    hlavnému CTA na obrazovke, a tým je CONTINUE.
//
// ⚠️ NÁPIS JE DVE SLOVÁ (Matej 23. 9.: *„text pri tlačítkach len «živá legenda»
//    a «psí anjel»"*). Kľúče `intro.alive` / `intro.deceased` nesú celú vetu
//    („Yes, a living legend" · „Waiting for me, up there") — tá patrí do intra,
//    kde bola otázka sama na obrazovke. Tu sedia `heroglyph.flow.dogs.status*`,
//    ktoré tie dve slová už MAJÚ a používa ich zoznam psov, takže rovnaká vec
//    sa volá rovnako na oboch miestach. Nové kľúče netreba.
//
// ⚠️ IKONKA SA FARBÍ MASKOU, NIE FILTROM. `filter: brightness(0)` vie urobiť
//    len čiernu; inkoust voľby je lapisový (`PICK_INK.lapis`) a filter by ho
//    iba približoval. → pamäť `feedback_filter_aproximuje_masku_farbu_presne`
// ════════════════════════════════════════════════════════════════════════════

/** Najstarší rok v ponuke dátumu odchodu — tá istá hodnota ako v IntroScreen. */
const MIN_DEATH_YEAR = 1990;

/** Inkoust nezvolenej ikonky. Doska je papyrus, takže tlmená hnedá z `LAB`,
 *  nie `--muted-foreground` (tá je z tmavého šatu a na papyruse zmizne). */
const LAB_MUTED = 'rgba(60,40,12,0.52)';

export type LifeStatus = 'alive' | 'deceased';

function iconStyle(url: string, color: string): React.CSSProperties {
  return {
    // 24. 9. 2026: ikonka sedí VNÚTRI rytej jamky (`.hf-pick .well`, 34 px),
    // takže samotná kresba je o dva stupne menšia — inak by sa dotýkala jej
    // okraja a jamka by prestala byť jamkou.
    width: 22,
    height: 22,
    flex: 'none',
    background: color,
    WebkitMask: `url(${url}) center / contain no-repeat`,
    mask: `url(${url}) center / contain no-repeat`,
  };
}

export function LifeStatusPick({
  value,
  onChange,
  onWantDate,
  deathDate,
}: {
  value: LifeStatus;
  onChange: (v: LifeStatus) => void;
  /** Klik na „psí anjel" — otvor popup s dátumom. */
  onWantDate: () => void;
  deathDate: string | null;
}) {
  const t = useT();

  // ⚠️ ŠAT JE ODTERAZ V `FLOW_CARVE_CSS` (24. 9. 2026), nie v inline objekte.
  //    Matej: *„vieš dať aj vedľa seba ikonku a text a nie nad seba"* — a to nie
  //    je len otočenie smeru: ikonka nad textom si pýta štvorec a dve slová pod
  //    ňou sa lámu, vedľa seba sa riadok číta ako jedna veta a doska sa upokojí.
  //    Tint aj lapisový inkoust ostávajú (`.hf-pick.on`), len ich nesie trieda,
  //    takže rovnakú voľbu inde v toku netreba opisovať druhýkrát.
  // ⚠️ IKONKA MÁ INKOUST DLAŽDICE, NIE VLASTNÝ. Od 25. 9. je dlaždica ZLATÁ
  //    (`.hf-pick.is-gold`, Matej: *„status či žije do zlatých tlačítok ako pri
  //    podstate"*) a kresba sedí v PAPYRUSOVEJ jamke — tlmená hnedá v nej zmizla
  //    a lapisová pri výbere hovorila inú farbu než lem. Obe polohy preto berú
  //    tmavý brandový inkoust; vybranú hovorí LEM dlaždice, nie odtieň kresby.
  // ⚠️ 26. 9. 2026 ~16:15 Matej na kroku MENO: *„tieto zlaté tlačítka majú byť
  //    bledé ako sme sa dohodli"* ⇒ `.is-pale` (bledá + lapisový výber, ako podstata
  //    a majiteľ). Novší pokyn prebíja 25. 9. *„do zlatých tlačítok"*; vybraná
  //    kresba berie lapisový inkoust výberu.
  const ink = (mine: LifeStatus) =>
    value === mine ? PICK_INK.lapis : LAB_MUTED;

  return (
    <div className="w-full flex flex-col gap-2">
      <p className="hf-legend" style={{ justifyContent: 'center' }}>
        {t('intro.question')}
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onChange('alive')}
          aria-pressed={value === 'alive'}
          className={`hf-pick is-pale${value === 'alive' ? ' on' : ''}`}
        >
          <span className="well">
            <span aria-hidden style={iconStyle(legendIconUrl, ink('alive'))} />
          </span>
          <span className="tx">{t('heroglyph.flow.dogs.statusAlive')}</span>
        </button>

        <button
          type="button"
          // Voľba a popup sú JEDEN úkon: kto klikne na anjela, ide práve pre to
          // políčko s dátumom. Druhý klik naň ho otvorí znova (oprava dátumu).
          onClick={() => { onChange('deceased'); onWantDate(); }}
          aria-pressed={value === 'deceased'}
          className={`hf-pick is-pale${value === 'deceased' ? ' on' : ''}`}
        >
          <span className="well">
            <span aria-hidden style={iconStyle(angelIconUrl, ink('deceased'))} />
          </span>
          <span className="tx">{t('heroglyph.flow.dogs.statusAngel')}</span>
        </button>
      </div>

      {/* Dátum je POTVRDENIE voľby, nie ďalší údaj — preto tichý riadok pod
          dvojicou a nie tretie pole. Bez neho by anjel vyzeral ako nedokončený. */}
      {value === 'deceased' && deathDate && (
        <button
          type="button"
          onClick={onWantDate}
          className="text-center text-[11px] tracking-wide underline underline-offset-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(14,14,14,0.6)' }}
        >
          {t('intro.deceasedDate.caption', { date: new Date(deathDate).toLocaleDateString() })}
        </button>
      )}
    </div>
  );
}

/**
 * Popup s dátumom odchodu. Šat je 1:1 s `NameModal` (papyrusová karta, zlaté
 * uloženie) — tá istá karta, akú človek na tejto obrazovke už videl pri mene.
 */
export function DeathDateModal({
  open,
  deathDate,
  onSave,
  onClose,
}: {
  open: boolean;
  deathDate: string | null;
  onSave: (iso: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const now = new Date();
  const seed = deathDate ? new Date(deathDate) : now;
  const [d, setD] = useState(seed.getDate());
  const [m, setM] = useState(seed.getMonth() + 1);
  const [y, setY] = useState(seed.getFullYear());

  if (!open) return null;

  return (
    // 🔴 POZÍCIA JE INLINE, NIE TRIEDOU. `.dark-bg > *` v globálnom CSS nastavuje
    //    `position: relative` a má vyššiu špecifickosť než Tailwind `.fixed` —
    //    popup je priamy potomok `.dark-bg`, takže mu pravidlo pozíciu prebilo
    //    a karta sadla na spodok obrazovky a vytiekla z nej. Zmerané 23. 9. 2026.
    <div
      className="flex items-center justify-center px-4"
      style={{ position: 'fixed', inset: 0, zIndex: 2100 }}
    >
      <motion.div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' } as React.CSSProperties}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.16 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full"
        style={{
          maxWidth: 520,
          background: 'linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)',
          border: '1.5px solid rgba(201,154,63,0.55)',
          borderRadius: 16,
          padding: '22px 16px 16px',
          boxShadow: '0 20px 64px rgba(0,0,0,0.65)',
        }}
        // Vysunutie zdola: popup prichádza z toho istého smeru ako blok
        // s otázkami, teda ako všetko, čo si na tejto obrazovke pýtame.
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.3, 1.1] }}
      >
        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: '1rem',
            textAlign: 'center',
            color: 'hsl(var(--gold-dark))',
            margin: 0,
            padding: '0 20px 16px',
          }}
        >
          {t('intro.deceasedDate.title')}
        </h3>
        <div className="flex justify-center" style={{ marginBottom: 18 }}>
          <DateDropdowns
            day={d}
            month={m}
            year={y}
            minYear={MIN_DEATH_YEAR}
            maxYear={now.getFullYear()}
            maxDate={now}
            onChange={(nd, nm, ny) => { setD(nd); setM(nm); setY(ny); }}
          />
        </div>
        <button
          type="button"
          onClick={() => onSave(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)}
          style={{
            width: '100%',
            height: 46,
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#000',
            background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
          }}
        >
          {t('pack.dog.memorial.save')}
        </button>
      </motion.div>
    </div>
  );
}
