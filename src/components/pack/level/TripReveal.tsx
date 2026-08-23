// ─────────────────────────────────────────────────────────────────────────────
// REVEAL PO ZAPÍSANÍ VÝLETU
//
// Obrazovka, ktorá príde po odoslaní výletu v sprievodcovi. Zdroj pravdy vzhľadu a časovania
// = nákres `plany/reveal-nakres.html`, odsúhlasený Matejom v siedmich kolách 23.–24. 8. 2026.
//
// STAVBA (Matej 23. 8., doslovne):
//   „reveal by bol vlastne viewport klasického náhľadu /map akurát popup cez celu obrazovku
//    hore by bolo zosvetlená foto a level a kolko zostáva a pod tým by bol obrazok nazov a
//    body v strede a rozpad pod tým"
//
//   · Mapa ostáva vzadu, stmavená — je to POPUP nad mapou, nie iná stránka.
//   · HEADER JE JEDEN PRVOK V DVOCH STAVOCH. Pri zavretí sa scvrkne na rozmery hlavičky mapy
//     a až potom celý overlay zhasne. Nie sú to dva komponenty.
//   · Foto hore je MAJITEĽA, nie psa („nie fotku som myslel majiteľa").
//   · ROZPAD BODOV JE IBA V ⓘ — uzavreté 24. 8.: „uzavrime to že ROZPAD bude iba v i nie na
//     obrazovke". Variant s rozbaľovaním priamo na obrazovke zanikol, neoživovať.
//   · Celkové body ani level v rozpade NIE SÚ — „to je predsa hore".
//   · Jednotka „BODOV" stojí VEDĽA čísla a je veľká (Matej 24. 8.: „bodov veľkým").
//
// LEVEL UP = scéna cez celú obrazovku (~5,6 s, zámerne pomalá):
//   0,00 tma · 0,20 fotky svorky zoomujú · 0,50+ psy dosadajú po jednom
//   1,15 PÚTNIK · 1,50 pilulka so STARÝM levelom
//   2,60 ZÁSAH — záblesk, prstence, konfety+iskry, iskrenie po obvode fotky aj pilulky,
//        číslo sa prehodí a pásmo prefarbí
//   4,80 rozplynutie · 5,60 späť na body
//
// ⚠️ Časovače držíme v jednom poli a pri odmountovaní ich rušíme — bez toho scéna dobehne
//    do odmountovaného komponentu a React vypíše varovanie o setState na mŕtvom strome.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useT } from '@/i18n/LanguageContext';
import type { LevelProgress, TripPointsResult } from '@/lib/tripPoints';
import { tierOfLevel, tierVars, crossedTier } from '@/lib/packTiers';
import { PointsBreakdown } from './PointsBreakdown';
import { REVEAL_CSS } from './revealCss';

export interface RevealDog {
  id: string;
  name: string;
  photo?: string | null;
}

export interface TripRevealProps {
  tripName: string;
  /** riadok pod názvom: „4,5 km · 180 m ↑ · Strážovské vrchy" */
  tripMeta: string;
  tripPhoto?: string | null;
  points: TripPointsResult;
  levelBefore: LevelProgress;
  levelAfter: LevelProgress;
  ownerAvatarUrl?: string | null;
  ownerInitial: string;
  dogs: RevealDog[];
  /** „Pridaj ďalší výlet" */
  onAddAnother: () => void;
  /** „Späť na mapu" — volá sa až po tom, čo sa header scvrkne */
  onClose: () => void;
}

/** Geometria svorky — polomer fotky majiteľa; psy sa počítajú z nej, nie z pevných čísel. */
const OWNER_SIZE = 132;
const DOG_SIZE = 66;

export function TripReveal({
  tripName, tripMeta, tripPhoto, points, levelBefore, levelAfter,
  ownerAvatarUrl, ownerInitial, dogs, onAddAnother, onClose,
}: TripRevealProps) {
  const t = useT();
  const leveledUp = levelAfter.level > levelBefore.level;
  const newTier = crossedTier(levelBefore.level, levelAfter.level);

  const [closing, setClosing] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [sceneOn, setSceneOn] = useState(false);
  const [sceneOut, setSceneOut] = useState(false);
  /** level, ktorý práve ukazuje pilulka v scéne — mení sa až v momente zásahu */
  const [sceneLevel, setSceneLevel] = useState(levelBefore.level);
  /** level, ktorý ukazuje HEADER — do konca scény drží starý */
  const [headerLevel, setHeaderLevel] = useState(levelBefore.level);
  const [counter, setCounter] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const headerTier = tierOfLevel(headerLevel);
  const sceneTier = tierOfLevel(sceneLevel);

  // ── ODPOČÍTAVANIE BODOV ───────────────────────────────────────────────────
  // Číslo nabieha po položkách rozpadu, nie plynulo od nuly — človek tak vidí, že sa skladá
  // z niečoho, aj keď rozpad neotvorí.
  useEffect(() => {
    let acc = 0;
    points.rows.forEach((row, i) => {
      later(() => {
        acc += row.points;
        const to = acc;
        const from = to - row.points;
        const t0 = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / 190);
          setCounter(Math.round(from + (to - from) * k));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, 800 + i * 140);
    });
    if (points.rows.length === 0) later(() => setCounter(points.total), 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── PRÍCHOD PRVKOV ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const show = (sel: string, cls: string, ms: number) =>
      later(() => el.querySelector(sel)?.classList.add(cls), ms);
    show('.rv-thumb', 'rv-pop', 200);
    show('.rv-name', 'rv-in', 340);
    show('.rv-meta', 'rv-in', 430);
    show('.rv-score', 'rv-pop', 560);
    show('.rv-unit', 'rv-in', 640);
    show('.rv-sumlink', 'rv-in', 800);

    const after = 800 + points.rows.length * 140 + 150;
    // lišta sa rozsvieti až keď je súčet na mieste
    later(() => el.querySelector('.rv-bar')?.classList.add('lit'), after);
    later(() => el.querySelector('.rv-cta')?.classList.add('rv-in'), after + (leveledUp ? 6800 : 800));
    if (leveledUp) later(() => setSceneOn(true), after + 1150);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── SCÉNA LEVELU ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sceneOn) return;
    const el = rootRef.current;
    if (!el) return;

    // stred výbuchu si NEODHADUJEME percentom — berie sa zo skutočnej polohy fotky majiteľa.
    // Odhad sedel len pri jednom počte psov a jednej výške okna.
    const owner = el.querySelector('.rv-ph--owner');
    if (owner) {
      const a = owner.getBoundingClientRect();
      el.style.setProperty('--fx-y', `${((a.top + a.height / 2) / window.innerHeight * 100).toFixed(1)}%`);
    }

    later(() => {
      el.querySelector('.rv-flash')?.classList.add('go');
      el.querySelectorAll('.rv-ring').forEach((r) => r.classList.add('go'));
      el.querySelectorAll('.rv-rim, .rv-pillrim').forEach((r) => {
        r.classList.add('spark');
        later(() => r.classList.remove('spark'), 2350);
      });
      el.querySelector('.rv-pill')?.classList.add('hit');
      // farby berie NOVÉ pásmo, nie to, v ktorom scéna začínala — `sceneTier` je v tomto
      // okamihu ešte starý (state sa prepína o riadok nižšie a prekreslí až v ďalšom rendere)
      const hitTier = tierOfLevel(levelAfter.level);
      spawnParticles(el, hitTier.a, hitTier.b);
      setSceneLevel(levelAfter.level);
      setHeaderLevel(levelAfter.level);
    }, 2600);

    later(() => setSceneOut(true), 4800);
    later(() => { setSceneOn(false); setSceneOut(false); }, 5600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneOn]);

  // premena čísla v pilulke — staré odletí, nové priletí
  const prevSceneLevel = useRef(levelBefore.level);
  const numTurning = prevSceneLevel.current !== sceneLevel;
  useEffect(() => { prevSceneLevel.current = sceneLevel; }, [sceneLevel]);

  const handleClose = () => {
    setClosing(true);
    later(() => setShowCoach(true), 700);
  };
  const finishCoach = () => { setShowCoach(false); onClose(); };

  // ── ROZLOŽENIE SVORKY ─────────────────────────────────────────────────────
  const dogSlots = useMemo(() => {
    const R = OWNER_SIZE / 2;
    const n = dogs.length;
    if (n === 0) return [];
    if (n === 1) return [{ x: Math.round(R * 0.68), y: Math.round(R * 0.66) }];
    const step = Math.min(DOG_SIZE - 5, 360 / n);
    const startX = (-step * (n - 1)) / 2;
    const baseY = Math.round(R * 0.74);
    return dogs.map((_, i) => ({ x: Math.round(startX + step * i), y: baseY }));
  }, [dogs]);

  const barPct = leveledUp
    ? (sceneLevel === levelAfter.level ? levelAfter.pct : 100)
    : levelAfter.pct;
  const shownLevel = headerLevel === levelAfter.level ? levelAfter : levelBefore;

  return (
    <div className={`rv${closing ? ' closing' : ''}`} ref={rootRef} style={tierVars(headerLevel)}>
      <style>{REVEAL_CSS}</style>
      <div className="rv-scrim" />

      <div className="rv-shell">
        {/* HEADER — ten istý prvok, len väčší; po zavretí sa scvrkne hore */}
        <div className="rv-hdr">
          <div className="rv-hdrow">
            <div className="rv-avatars">
              {ownerAvatarUrl
                ? <img className="rv-av" src={ownerAvatarUrl} alt="" />
                : <span className="rv-av">{ownerInitial}</span>}
              {dogs.slice(0, 3).map((d) => (
                d.photo
                  ? <img key={d.id} className="rv-av rv-av--dog" src={d.photo} alt="" />
                  : <span key={d.id} className="rv-av rv-av--dog">{d.name.slice(0, 1).toUpperCase()}</span>
              ))}
            </div>
            <div className="rv-who">
              <div className="rv-rank">
                {t('pack.map.rankPilgrim')}
                <span className="rv-chip">
                  {t('pack.tier.chip', { level: headerLevel, tier: t(`pack.tier.${headerTier.key}`) })}
                </span>
              </div>
              <div className="rv-pts">
                {t('pack.tier.pointsOfNext', { points: shownLevel.points, next: shownLevel.nextPoints })}
              </div>
            </div>
          </div>
          <div className="rv-bar">
            <i style={{ width: `${barPct}%` }} />
            <span className="rv-glow" />
          </div>
          <p className="rv-tonext">
            {t('pack.tier.toNextShort', { n: shownLevel.toNext })}
          </p>
        </div>

        {/* TELO — miniatúra, názov, meta, body, tichý odkaz na rozpad */}
        <div className="rv-body">
          <div className="rv-core">
            {tripPhoto
              ? <img className="rv-thumb" src={tripPhoto} alt="" />
              : <div className="rv-thumb">🏞️</div>}
            <div className="rv-name">{tripName}</div>
            <div className="rv-meta">{tripMeta}</div>
            <div className="rv-scorewrap">
              <div className="rv-score">+{counter}</div>
              <span className="rv-unit">{t('pack.reveal.pointsUnit')}</span>
            </div>
            <button className="rv-sumlink" onClick={() => setShowSheet(true)}>
              {/* ⓘ je KRESLENÁ ikona, nie písmeno „i" v krúžku — Matej: „i musí vyzerať ako i" */}
              <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true">
                <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="10" cy="5.6" r="1.25" fill="currentColor" />
                <path d="M10 8.9v5.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
              <span>{t('pack.reveal.whyLink')}</span>
            </button>
          </div>

          <div className="rv-cta">
            <button className="rv-btn-gold" onClick={onAddAnother}>{t('pack.reveal.addAnother')}</button>
            <button className="rv-btn-ghost" onClick={handleClose}>{t('pack.reveal.backToMap')}</button>
          </div>
        </div>
      </div>

      {/* ROZPAD — jediné miesto, kde žije */}
      {showSheet && (
        <div className="rv-sheet" onClick={() => setShowSheet(false)}>
          <div className="rv-card" onClick={(e) => e.stopPropagation()}>
            <div className="rv-cardhead">
              <h3>{t('pack.reveal.whyTitle')}</h3>
              <button className="rv-x" onClick={() => setShowSheet(false)} aria-label={t('pack.tier.close')}>
                <X size={15} />
              </button>
            </div>
            <PointsBreakdown rows={points.rows} highlightKey="pack.points.newRange" />
            <div className="rv-total">
              <span>{t('pack.reveal.forThisTrip')}</span>
              <b>+{points.total}</b>
            </div>
          </div>
        </div>
      )}

      {/* SCÉNA LEVELU */}
      {sceneOn && (
        <div className={`rv-scene${sceneOut ? ' out' : ''}`} style={tierVars(sceneLevel)}>
          <div className="rv-photos">
            <span className="rv-slot" style={{ ['--x' as string]: '0px', ['--y' as string]: '0px' }}>
              <span className="rv-rim" />
              {ownerAvatarUrl
                ? <img className="rv-ph rv-ph--owner" src={ownerAvatarUrl} alt="" />
                : <span className="rv-ph rv-ph--owner">{ownerInitial}</span>}
            </span>
            {dogs.map((d, i) => (
              <span
                key={d.id}
                className="rv-slot rv-slot--dog"
                style={{
                  ['--x' as string]: `${dogSlots[i]?.x ?? 0}px`,
                  ['--y' as string]: `${dogSlots[i]?.y ?? 0}px`,
                  zIndex: 5 + i,
                }}
              >
                {d.photo
                  ? <img className="rv-ph" src={d.photo} alt=""
                         style={{ width: DOG_SIZE, height: DOG_SIZE, animationDelay: `${(0.5 + i * 0.14).toFixed(2)}s` }} />
                  : <span className="rv-ph"
                          style={{ width: DOG_SIZE, height: DOG_SIZE, fontSize: Math.round(DOG_SIZE * 0.4),
                                   animationDelay: `${(0.5 + i * 0.14).toFixed(2)}s` }}>
                      {d.name.slice(0, 1).toUpperCase()}
                    </span>}
              </span>
            ))}
          </div>
          <div className="rv-scene-rank">{t('pack.map.rankPilgrim')}</div>
          <div className="rv-pillwrap">
            <div className="rv-pill">
              <span className="rv-pillrim" />
              <span className="rv-pill-txt">
                {t('pack.tier.levelWord')}{' '}
                <span className={`rv-num${numTurning ? ' turn' : ''}`}>
                  {numTurning && <span className="out">{prevSceneLevel.current}</span>}
                  <span className="now">{sceneLevel}</span>
                </span>
              </span>
            </div>
          </div>
          {/* Nové PÁSMO je udalosť, ktorú človek uvidí deväťkrát za celú cestu — dostane vetu.
              Obyčajný level up ju nedostane, inak by sa zotreli. */}
          {newTier && sceneLevel === levelAfter.level && (
            <div className="rv-meta rv-in" style={{ opacity: 1, marginTop: -8 }}>
              {t('pack.tier.newTier', { tier: t(`pack.tier.${sceneTier.key}`) })}
            </div>
          )}
        </div>
      )}

      <div className="rv-flash" />
      <div className="rv-ring" />
      <div className="rv-ring two" />
      <div className="rv-fx" />

      {/* COACH — až keď sa header usadí (Matej: „kde sa jeho výlety ukladajú a kde uvidí body") */}
      {showCoach && (
        <div className="rv-coach">
          <div className="rv-bubble">
            <h4>{t('pack.reveal.coachTitle')}</h4>
            <p>{t('pack.reveal.coachBody')}</p>
            <button className="rv-btn-gold" style={{ padding: 11, fontSize: 11.5 }} onClick={finishCoach}>
              {t('pack.reveal.coachOk')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Konfety + iskry. Robia sa priamo v DOM, nie cez state — je ich stovka a každý re-render
 * Reactu by ich prekreslil od začiatku, takže by animácia poskakovala.
 * Farby berú z AKTUÁLNEHO PÁSMA; ďalšia farebná os by v appke, kde farba už nesie význam,
 * len rozriedila to, čo znamená.
 */
function spawnParticles(root: HTMLElement, tierA: string, tierB: string) {
  const box = root.querySelector('.rv-fx');
  if (!box) return;
  box.innerHTML = '';
  const cols = [tierA, tierB, '#F5F0E4', tierA];

  for (let i = 0; i < 54; i++) {
    const el = document.createElement('i');
    el.className = 'rv-cf';
    // hĺbka −220 (ďaleko) … +160 (blízko diváka) — z nej sa odvodzuje veľkosť aj rozostrenie
    const z = -220 + Math.random() * 380;
    const s = 0.55 + ((z + 220) / 380) * 1.15;
    el.style.background = cols[i % cols.length];
    el.style.marginLeft = `${Math.random() * 100 - 50}vw`;
    el.style.setProperty('--z', `${z.toFixed(0)}px`);
    el.style.setProperty('--dz', `${(Math.random() * 120 - 30).toFixed(0)}px`);
    el.style.setProperty('--s', s.toFixed(2));
    el.style.setProperty('--dx', `${(Math.random() * 160 - 80).toFixed(0)}px`);
    el.style.setProperty('--rot', `${(Math.random() * 1000 - 500).toFixed(0)}deg`);
    if (z < -90) el.style.filter = 'blur(1.4px)';
    el.style.animation = `rvFall ${(1.9 + Math.random() * 1.3).toFixed(2)}s cubic-bezier(.22,.55,.5,1) ${(Math.random() * 0.5).toFixed(2)}s forwards`;
    box.appendChild(el);
  }
  for (let j = 0; j < 40; j++) {
    const sp = document.createElement('i');
    sp.className = 'rv-sp';
    const ang = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 260;
    const c = cols[j % cols.length];
    sp.style.background = c;
    sp.style.boxShadow = `0 0 10px ${c}`;
    sp.style.setProperty('--dx', `${(Math.cos(ang) * dist).toFixed(0)}px`);
    sp.style.setProperty('--dy', `${(Math.sin(ang) * dist * 0.72).toFixed(0)}px`);
    sp.style.setProperty('--dz', `${(60 + Math.random() * 320).toFixed(0)}px`);
    sp.style.setProperty('--s', (1.4 + Math.random() * 2.6).toFixed(2));
    sp.style.animation = `rvSpark ${(0.9 + Math.random() * 0.8).toFixed(2)}s cubic-bezier(.15,.7,.3,1) ${(Math.random() * 0.22).toFixed(2)}s forwards`;
    box.appendChild(sp);
  }
  window.setTimeout(() => { box.innerHTML = ''; }, 3600);
}
