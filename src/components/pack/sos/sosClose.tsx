// SOS — KONIEC PÁTRANIA (Matej 5. 11. 2026, nákres plany/nakresy/koniec-patrania-2026-11-05, „súhlasím so všetkým“).
// Ťuk NAŠIEL SA už pátranie neukončí hneď, najprv sa spýta, ako sa skončilo: je živý a doma · bohužiaľ nežije · ešte nie.
//  · živý  → zelená (splnené), počty, zápis do denníka, zelená karta vo FEEDe (rieši `PackSosDetail` + `FeedSosCard`)
//  · nežije → úprimné slová (variant A), žiadna zelená, žiadne zdieľanie; ponuka anjela len majiteľovi, denník len na jeho ťuk
// Pawmate smie obe voľby; majiteľ sa to dozvie a vie stav vrátiť. Okná = `PackPopup`.
import { useState } from 'react';
import { PackPopup } from '@/components/pack/PackPopup';
import { PF_FIELD_CSS, PACK_BOX } from '@/components/pack/packTheme';
import type { LostOutcome, SosMine } from '@/lib/sos';
import { SOS_CSS, type SosT } from './sosShared';

/** Otázka po ťuku NAŠIEL SA. Nič sa nezmení, kým si človek nevyberie. */
export function ClosePopup({ name, s, mate, busy, err, onPick, onClose }: {
  name: string; s: SosT; mate: boolean; busy: boolean; err?: string; onPick: (o: LostOutcome) => void; onClose: () => void;
}) {
  return (
    <PackPopup title={s('pack.sos.close.title', { name })} onClose={onClose}>
      <style>{PF_FIELD_CSS + SOS_CSS}</style>
      <div className="sos-stack">
        <p className="sos-p">{s('pack.sos.close.sub')}</p>
        {mate && <p className="sos-small">{s('pack.sos.close.mateNote')}</p>}
        {err && <p className="sos-err">{err}</p>}
        <div className="sos-opts">
          <button type="button" className="sos-opt sos-opt--alive" disabled={busy} onClick={() => onPick('alive')}>{s('pack.sos.close.alive')}</button>
          <button type="button" className="sos-opt sos-opt--calm" disabled={busy} onClick={() => onPick('deceased')}>{s('pack.sos.close.dead')}</button>
          <button type="button" className="sos-opt sos-opt--none" disabled={busy} onClick={onClose}>{s('pack.sos.close.notYet')}</button>
        </div>
      </div>
    </PackPopup>
  );
}

export type GoneStep = 'words' | 'angel' | 'done';

/** „Nežije“: úprimné slová → (len majiteľ) ponuka anjela → (len majiteľ) denník na jeho ťuk. */
export function GonePopup({ name, s, owner, step, diaryText, diaryDone, diaryBusy, diaryErr, onStep, onAngel, onDiary, onClose }: {
  name: string; s: SosT; owner: boolean; step: GoneStep; diaryText: string; diaryDone: boolean; diaryBusy: boolean; diaryErr?: string;
  onStep: (st: GoneStep) => void; onAngel: () => void; onDiary: (text: string) => void; onClose: () => void;
}) {
  const [text, setText] = useState(diaryText);
  return (
    <PackPopup title={step === 'angel' ? s('pack.sos.gone.angelTitle', { name }) : step === 'done' ? s('pack.sos.gone.diaryTitle') : undefined} label={name} onClose={onClose}>
      <style>{PF_FIELD_CSS + SOS_CSS}</style>
      <div className="sos-stack">
        {step === 'words' && (
          <>
            <p className="sos-p">{s('pack.sos.gone.words', { name })}</p>
            <button type="button" className="sos-cta" onClick={() => (owner ? onStep('angel') : onClose())}>{s('pack.sos.gone.ok')}</button>
          </>
        )}
        {step === 'angel' && (
          <>
            <p className="sos-p">{s('pack.sos.gone.angelText')}</p>
            <button type="button" className="sos-cta" onClick={onAngel}>{s('pack.sos.gone.angelYes')}</button>
            <button type="button" className="sos-cta sos-cta--ghost" onClick={() => onStep('done')}>{s('pack.sos.gone.angelNo')}</button>
          </>
        )}
        {step === 'done' && (
          <>
            {diaryDone ? (
              <p className="sos-p">{s('pack.sos.gone.diaryDone')}</p>
            ) : (
              <>
                <label className="sos-field">
                  <textarea className="pf-field" rows={4} maxLength={400} value={text} onChange={(e) => setText(e.target.value)} />
                </label>
                <p className="sos-small">{s('pack.sos.gone.diaryHint')}</p>
                {diaryErr && <p className="sos-err">{diaryErr}</p>}
                <button type="button" className="sos-cta" disabled={diaryBusy || !text.trim()} onClick={() => onDiary(text.trim())}>{s('pack.sos.gone.diaryBtn')}</button>
              </>
            )}
            <button type="button" className="sos-cta sos-cta--ghost" onClick={onClose}>{s('pack.sos.gone.done')}</button>
          </>
        )}
      </div>
    </PackPopup>
  );
}

/** Čísla pátrania — len to, čo naozaj meriame (zdieľanie = ťuk na ZDIEĽAŤ, hovor = odkrytie telefónu, upozornenia = pushe pri vyhlásení). */
export function SosNumbers({ mine, s }: { mine: SosMine; s: SosT }) {
  const cells: Array<[string, number]> = [
    [s('pack.sos.alive.days'), mine.search_days],
    [s('pack.sos.alive.shares'), mine.shares],
    [s('pack.sos.alive.calls'), mine.phone_reveals],
    [s('pack.sos.alive.seen'), mine.sightings.length],
  ];
  // Upozornené zariadenia: bez čísla, keď sa o pátraní okolie nikdy neupozornilo (strata skončila skôr, než odišli pushe)
  if (mine.notified_at) cells.push([s('pack.sos.alive.notified'), mine.notified_count ?? 0]);
  return (
    <div className="sos-nums">
      {cells.map(([label, n]) => (
        <div key={label} className="sos-num" style={{ ...PACK_BOX.subblock }}><b>{n}</b><small>{label}</small></div>
      ))}
    </div>
  );
}
