// ADD TRIP — vstupný popup (vlna 1, plany/zadanie-addtrip-flow-2026-07-27.md §4.1).
// Dva bloky, bez nadpisu popupu: „WE'RE HEADING OUT" (plán) vs „WE'VE BEEN THERE" (log).
// Žije na tmavom povrchu Portalu → pk-glass primitív z packTheme.ts (NIE papyrus — ten je pre
// bledé bloky podľa Entry.tsx locku, sem nepatrí).
import { GLASS_CSS, PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import type { TripState } from './addTripModel';

const GOLD = '#C99A3F'; // §4.1 + §14: hover na blokoch = zlatý okraj, presne tento hex

export type AddTripEntryProps = {
  onPick: (state: TripState) => void;
  onClose: () => void;
};

// state = cieľový TripState (addTripModel.ts) po výbere bloku — 'planned' = „WE'RE HEADING OUT",
// 'walked' = „WE'VE BEEN THERE" (§4.1 tabuľka). titleKey/textKey — literál sa vykresľuje cez t()
// v komponente (BLOCKS je modulová konštanta, useT() je hook a nesmie sa volať mimo komponentu).
const BLOCKS: Array<{ state: TripState; emoji: string; titleKey: string; textKey: string }> = [
  { state: 'planned', emoji: '🗓️', titleKey: 'pack.addTrip.entry.planned.title', textKey: 'pack.addTrip.entry.planned.text' },
  { state: 'walked', emoji: '✅', titleKey: 'pack.addTrip.entry.walked.title', textKey: 'pack.addTrip.entry.walked.text' },
];

export function AddTripEntry({ onPick, onClose }: AddTripEntryProps) {
  const t = useT();
  return (
    <div className="att-entry-backdrop" onClick={onClose}>
      <style>{GLASS_CSS}</style>
      <style>{ENTRY_CSS}</style>
      <div className="att-entry-panel pk-glass" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="att-entry-close" onClick={onClose} aria-label={t('pack.addTrip.entry.closeAriaLabel')}>×</button>
        <div className="att-entry-blocks">
          {BLOCKS.map((b) => (
            <button key={b.state} type="button" className="att-entry-block" onClick={() => onPick(b.state)}>
              <span className="att-entry-emoji" aria-hidden="true">{b.emoji}</span>
              <span className="att-entry-title">{t(b.titleKey)}</span>
              <span className="att-entry-text">{t(b.textKey)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const ENTRY_CSS = `
.att-entry-backdrop{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;}
/* Horný padding je väčší než ostatné strany zámerne: krížik sedí v rohu na vlastnom odsadení
   (nie na paddingu panela), takže bez tejto rezervy sa dotýka rámu aj blokov pod ním.
   Matej 2026-08-05: „krížik je nalepený na rámiku = nevkusné, treba dopriať tomu priestor."
   Druhé kolo: krúžok preč, samotný znak menší — kruh z neho robil ovládací prvok rovnakej váhy
   ako dva hlavné bloky pod ním, hoci je to len východ. Klikacia plocha ostáva 32×32 px (dotyk),
   viditeľný je iba znak. */
.att-entry-panel{position:relative;width:100%;max-width:640px;padding:52px 32px 32px;}
.att-entry-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border:0;background:transparent;color:${T.onDarkDim};font-size:15px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;}
.att-entry-close:hover{color:${GOLD};}
.att-entry-blocks{display:flex;gap:18px;align-items:stretch;}
.att-entry-block{flex:1 1 0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:rgba(245,240,228,0.04);border:1.5px solid ${T.onDarkBorder};border-radius:16px;padding:24px 20px;cursor:pointer;transition:border-color .15s ease,background .15s ease,transform .15s ease;}
.att-entry-block:hover,.att-entry-block:focus-visible{border-color:${GOLD};background:rgba(201,154,63,0.08);transform:translateY(-2px);outline:none;}
.att-entry-emoji{font-size:38px;line-height:1;margin-bottom:10px;}
.att-entry-title{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${T.onDark};margin-bottom:10px;}
.att-entry-text{font-family:${FONT_UI};font-weight:400;font-size:12.5px;line-height:1.45;color:${T.onDarkDim};max-width:210px;min-height:2.9em;display:flex;align-items:center;justify-content:center;}
@media (max-width:640px){
  .att-entry-blocks{flex-direction:column;}
  .att-entry-block{padding:26px 18px;}
}
`;
