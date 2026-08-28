// KARTA V DEŇ VÝLETU — „bol si tam?" (Matej 2026-08-25, postavené 26. 8.)
//
// „v deň výletu príde upozornenie či už človek prešiel výlet -áno alebo nie nebol -može odložiť
//  na neskor alebo vymazať?"
//
// 🔴 PUSH NOTIFIKÁCIA V PROJEKTE NEEXISTUJE (service worker je len na dlaždice mapy), takže
// prvý kanál je karta pri otvorení appky. Otázka aj tri odpovede sú tie isté, nech sa spýta
// ktorýkoľvek kanál — vymeniť sa raz bude dať doručenie, nie obsah.
//
// ⚠️ PREČO NIE `NextTripCard.tsx`, kam mierilo zadanie: ten blok sa na `/pack` NEMOUNTUJE od
// 9. 8. 2026 — nahradil ho `TripSpotlight` (plagát + planéta) a `NextTripCard` odvtedy parkuje
// ako `PackTree`/`DailyPrayers`. Karta dorobená tam by nebola vidieť.
//
// Matej 26. 8. si vybral VLASTNÚ KARTU NAD PLAGÁTOM (nie prepnutie plagátu na otázku):
// objaví sa, len keď je na čo odpovedať, a zmizne v momente odpovede — plagát ostáva plagátom.
//
// KTORÝ PLÁN SA PÝTA: vlastné `plan-` záznamy z `readLocalTrails()`. Zámerne NIE triplist —
// ten sa plní až `seedTriplistFromPlans()` pri mounte triplistu, takže čerstvo založený plán
// by v ňom ešte nebol a karta by mlčala. Zdroj pravdy pre „kedy" je `trail.date` (tri presnosti,
// viď `addtrip/planDate.ts`), fázu počíta `planReminder.planPhase()` z KONCA obdobia.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { readLocalTrails, readWalkedIds, updateLocalTrail, visibleLocalTrails } from './tripShared';
import { readPlans, writePlans, readEvents, writeEvents, type PartnerEvent } from './packCommunity';
import { readTriplist, upsertMyTrip } from './triplist/triplist';
import { buildPlanDate, planDateLabel, planDeadline, type PlanPrecision } from './addtrip/planDate';
import { clearPlanMissed, markPlanMissed, planPhase } from './planReminder';
import { placeholderFor } from '@/lib/tripPlaceholder';
import { PACK_THEME, PACK_BOX, FONT_TITLE, FONT_UI } from './packTheme';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

// Rad tlačidiel: na širokom povrchu jeden riadok, na mobile primárne cez celú šírku a dve
// náhradné vedľa seba. Bez tohto sa tri tlačidlá na 390 px lámali pod seba, každé inak široké
// (rovnaká chyba ako pri pilulkách — rad prvkov má vyplniť šírku rovnakými dielmi).
// Hranica 720 px je tá istá, akú drží psí blok na /pack/dogs — jedno číslo naprieč appkou.
// POZOR: toto je JS template literal. Spätný apostrof v komentári zhodí build a tsc to nechytí.
const CSS = [
  '.pac-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;}',
  '.pac-btns > button{flex:1 1 auto;}',
  '@media (max-width:720px){',
  '  .pac-btns > .pac-primary{flex:1 1 100%;}',
  '}',
].join('\n');
const CSS_ID = 'pac-css';
function ensureCss(): void {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return;
  const el = document.createElement('style');
  el.id = CSS_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function PlanAskCard() {
  const t = useT();
  const navigate = useNavigate();
  ensureCss();

  /** Odpoveď kartu schová bez reloadu — `answered` je jediný dôvod, prečo sa prekresľuje.
   *  Zámerne sa NEHĽADÁ ďalší plán na spýtanie: dve otázky za sebou v jednej sekunde pôsobia
   *  ako výsluch. Ďalší príde pri najbližšom otvorení appky. */
  const [answered, setAnswered] = useState<string[]>([]);
  const [moving, setMoving] = useState(false);
  const [precision, setPrecision] = useState<PlanPrecision>('exact');
  const [day, setDay] = useState(todayISO);
  const [month, setMonth] = useState(() => todayISO().slice(0, 7));
  // Východiskový týždeň = ten, v ktorom sme (1.–7. = 1, 8.–14. = 2 …). Jednotka by pri presune
  // v polovici mesiaca ponúkla termín, ktorý už uplynul — a presúvame práve preto, že uplynul.
  const [week, setWeek] = useState(() => Math.ceil(new Date().getDate() / 7));

  const ask = useMemo(() => {
    const nowMs = Date.now();
    const walked = readWalkedIds();
    // `visibleLocalTrails` bez príznaku odfiltruje plány, na ktoré už padlo „nešiel som" —
    // presne to isté filtrovanie, aké ich drží mimo mapy. Netreba ho tu opakovať.
    const mine = visibleLocalTrails(readLocalTrails());
    return mine
      .filter((tr) => tr.id.startsWith('plan-') && !walked.has(tr.id) && !answered.includes(tr.id))
      .filter((tr) => planPhase(tr.date, nowMs) === 'ask')
      .sort((a, b) => (planDeadline(a.date) ?? '').localeCompare(planDeadline(b.date) ?? ''))[0] ?? null;
  }, [answered]);

  if (!ask) return null;

  const trail: HeroTrail = ask;
  const photo = trail.photos?.[0] || placeholderFor(trail.acts, trail.id);

  /** PRESUNÚŤ — plán ostáva, mení sa termín. Dátum leží na TROCH miestach a všetky tri sa
   *  čítajú inde: záznam trasy (mapa, karta výletu, táto pripomienka), `trp-plans` (odpočet
   *  v hlavičke) a triplist (MY TRIPS). Keby sa prepísalo len jedno, appka by o tom istom
   *  výlete tvrdila dva rôzne termíny. Inzerát „hľadám svorku" ide s nimi — pozvánka na
   *  včerajšok je horšia než žiadna. */
  const reschedule = () => {
    const next = buildPlanDate(precision, month, precision === 'week' ? week : day);
    // ⚠️ Poistka, nie hlavná obrana: minulé termíny sú vypnuté už v ponuke (`min` na poliach,
    // `weekPast()` na tlačidlách). Toto chytí ručne dopísaný dátum v poli — presunúť výlet
    // do minulosti znamená, že sa naň appka spýta hneď pri ďalšom otvorení.
    if (!next || (planDeadline(next) ?? '') < todayISO()) return;
    const tid = trail.id;
    updateLocalTrail(tid, { date: next });
    writePlans(readPlans().map((p) => (p.tripId === tid ? { ...p, date: next } : p)));
    if (readTriplist()[tid]) upsertMyTrip(tid, { date: next });
    writeEvents(readEvents().map((e): PartnerEvent => (
      e.tripId === tid ? { ...e, dates: [next], month: next.slice(0, 7) } : e
    )));
    // Presun ruší predošlé „nešiel som" — plán práve prestal byť neuskutočnený.
    clearPlanMissed(tid);
    setMoving(false);
    setAnswered((prev) => [...prev, tid]);
  };

  /** NEŠIEL SOM — Matej 25. 8.: „nechať v historii iba v tripliste u autora nikde inde".
   *  Preto sa NIČ NEMAŽE: záznam trasy aj riadok v tripliste ostávajú, len sa označí a
   *  `visibleLocalTrails` ho odteraz vynecháva všade okrem triplistu. Von ide plán (odpočet
   *  na výlet, ktorý sa nekonal) a inzerát (pozvánka, ktorá už nikam nevedie). */
  const dismiss = () => {
    const tid = trail.id;
    markPlanMissed(tid);
    writePlans(readPlans().filter((p) => p.tripId !== tid));
    writeEvents(readEvents().filter((e) => e.tripId !== tid));
    setAnswered((prev) => [...prev, tid]);
  };

  // ÁNO → tripflow nad tým istým záznamom. Parameter číta `PackMap` (`?walk=`) a otvára
  // `openWalkPlan()`, teda tú istú cestu, akou sa plán zapisuje kliknutím na mape.
  const logIt = () => navigate(`/pack/map?walk=${encodeURIComponent(trail.id)}`);

  /** Týždeň, ktorý sa v zvolenom mesiaci už skončil. Ponúkať ho znamená ponúkať termín,
   *  na ktorý sa appka spýta hneď zajtra. */
  const weekPast = (w: number) => (planDeadline(`${month}-W${w}`) ?? '') < todayISO();

  const btnBase: React.CSSProperties = {
    borderRadius: 8,
    padding: '10px 14px',
    fontFamily: FONT_TITLE,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
  // CTA (§14 LOCKED): .btn-gold — gradient 135°, radius 8, papyrusový rám. NIE pilulka.
  const btnGold: React.CSSProperties = {
    ...btnBase,
    background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
    border: '1px solid rgba(250, 244, 236, 0.30)',
    color: '#000',
  };
  const btnGhost: React.CSSProperties = {
    ...btnBase,
    background: 'transparent',
    border: `1px solid ${T.border}`,
    color: T.inkWarm,
  };
  const toggle = (on: boolean): React.CSSProperties => ({
    ...btnBase,
    flex: '1 1 0',
    padding: '8px 10px',
    fontSize: 10,
    background: on ? 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)' : 'transparent',
    border: `1px solid ${on ? 'rgba(250,244,236,0.30)' : T.border}`,
    color: on ? '#000' : T.inkWarm,
  });
  const input: React.CSSProperties = {
    width: '100%',
    marginTop: 8,
    padding: '9px 10px',
    borderRadius: 8,
    border: '1px solid rgba(179,130,45,0.55)',
    background: '#FBF5E6',
    color: T.inkStrong,
    fontFamily: FONT_UI,
    fontSize: 13,
  };

  return (
    <div style={{ ...PACK_BOX.card, padding: 14, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div
        aria-hidden
        style={{
          flexShrink: 0,
          width: 92,
          height: 92,
          borderRadius: 10,
          backgroundImage: `url('${photo}')`,
          backgroundColor: '#1a1a1a',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* ⚠️ Základ 150 px, nie 240. Pri 240 sa textový stĺpec na 390 px zlomil POD fotku a vedľa
          nej ostala prázdna plocha na celú výšku — karta vyzerala rozbito. 150 sa do zvyšku
          riadku (390 − 28 odsadenie − 92 fotka − 16 medzera = 254 px) zmestí, takže fotka a text
          držia jeden riadok na každej šírke a lámu sa len tlačidlá. */}
      <div style={{ flex: '1 1 150px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span
          style={{
            fontFamily: FONT_UI,
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: T.cardEdge,
          }}
        >
          {t('pack.planAsk.eyebrow')}
        </span>
        <span style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 16, lineHeight: 1.25, color: T.inkStrong }}>
          {trail.name}
        </span>
        <span style={{ fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm }}>
          {t('pack.planAsk.hint', { date: planDateLabel(trail.date, (n) => t('pack.addTrip.plan.whenWeekN', { n: String(n) })) })}
        </span>

        {moving ? (
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['exact', 'week', 'month'] as const).map((pr) => (
                <button key={pr} type="button" style={toggle(precision === pr)} onClick={() => setPrecision(pr)}>
                  {t(`pack.addTrip.plan.when.${pr}`)}
                </button>
              ))}
            </div>
            {precision === 'exact' ? (
              <input type="date" style={input} value={day} min={todayISO()} onChange={(e) => setDay(e.target.value)} />
            ) : (
              <>
                <input type="month" style={input} value={month} min={todayISO().slice(0, 7)} onChange={(e) => setMonth(e.target.value)} />
                {precision === 'week' && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {[1, 2, 3, 4].map((w) => (
                      <button
                        key={w}
                        type="button"
                        disabled={weekPast(w)}
                        style={{ ...toggle(week === w), opacity: weekPast(w) ? 0.35 : 1, cursor: weekPast(w) ? 'not-allowed' : 'pointer' }}
                        onClick={() => setWeek(w)}
                      >
                        {t('pack.addTrip.plan.whenWeekN', { n: String(w) })}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="pac-btns" style={{ marginTop: 10 }}>
              <button type="button" className="pac-primary" style={btnGold} onClick={reschedule}>{t('pack.planAsk.moveSave')}</button>
              <button type="button" style={btnGhost} onClick={() => setMoving(false)}>{t('pack.planAsk.cancel')}</button>
            </div>
          </div>
        ) : (
          <div className="pac-btns">
            <button type="button" className="pac-primary" style={btnGold} onClick={logIt}>{t('pack.planAsk.yes')}</button>
            <button type="button" style={btnGhost} onClick={() => setMoving(true)}>{t('pack.planAsk.move')}</button>
            <button type="button" style={btnGhost} onClick={dismiss}>{t('pack.planAsk.no')}</button>
          </div>
        )}
      </div>
    </div>
  );
}
