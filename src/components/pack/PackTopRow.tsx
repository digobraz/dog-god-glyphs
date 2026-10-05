// ── HORNÝ RAD /pack — [AINUBIS · šípka späť · pravý slot] (LOCK 27. 9. 2026) ──────────────
//
// Jeden rad pre každú obrazovku, ktorá hore niečo má: homepage, DOG ID, profil, triplist,
// SNIFFER, príbeh, kvízy. Čísla sú v `PACK_TOPROW` (packTheme.ts), tu je len tvar.
// Dovtedy si každá obrazovka kreslila vlastnú hlavičku: šípka 36 na 16 px (SNIFFER), 38 na
// 26 px (triplist), vľavo na 16 px (príbeh), krížik vpravo (kvízy) a AINUBIS raz hore vľavo,
// raz v strede, raz vpravo, raz dole.
//
// Rodič dá stĺpcu `padding-top: PACK_TOPROW_PAD` a rad vloží ako prvé dieťa — rad si sám
// dopočíta medzeru tak, aby obsah začal na `PACK_TOPROW.content`.
//
// ⚠️ ŠÍRKA RADU = ŠÍRKA STĹPCA HOMEPAGE (832), nie šírka rodiča. SNIFFER (640) a kvíz
//    (624) majú užší stĺpec — keby rad šiel s nimi, AINUBIS by na PC na každej obrazovke
//    stál inde. Rad sa preto centruje na stred rodiča a berie šírku z `PACK_COL_INNER`.
//    Podmienka: rodič je vodorovne na stred okna (všetky obrazovky vyššie sú).
// ⚠️ NIE sticky (5. 10. 2026, test po FLIPe): rad nemá podklad, takže pri rolovaní plával cez
//    obsah — logo cez „€94 RESCUE“, kapsula cez km PILGRIMA. Rad ide s obsahom; AINUBIS je
//    stále v spodnej lište. Miesto v toku je rovnaké (padding-top rodiča nesie `top`).
// ⚠️ `translate`, nie `transform` — hover kolieska píše `transform` a dedenie sa nesmie biť.
import type { ReactNode } from 'react';
import { HubAinubis } from './PackNotifications';
import { BackButton } from './BackButton';
import { PACK_TOPROW, PACK_COL_INNER, PACK_COL_PAD } from './packTheme';

const CSS = `
.pk-toprow{position:relative;z-index:30;
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;box-sizing:border-box;
  height:${PACK_TOPROW.h}px;margin-bottom:${PACK_TOPROW.content - PACK_TOPROW.top - PACK_TOPROW.h}px;
  width:min(${PACK_COL_INNER}px, calc(100vw - ${2 * PACK_COL_PAD.mobile}px));margin-left:50%;translate:-50% 0;
  pointer-events:none;}
@media (min-width:640px){.pk-toprow{width:min(${PACK_COL_INNER}px, calc(100vw - ${2 * PACK_COL_PAD.desktop}px));}}
.pk-toprow > *{pointer-events:auto;}
.pk-toprow-l{justify-self:start;display:flex;}
.pk-toprow-r{justify-self:end;display:flex;align-items:center;}
`;

export function PackTopRow({ onBack, backLabel, right }: {
  /** Bez `onBack` je stred prázdny (homepage, DOG ID, profil). */
  onBack?: () => void;
  backLabel?: string;
  /** Pravý kraj: správy a upozornenia, nastavenia SNIFFERu… */
  right?: ReactNode;
}) {
  return (
    <div className="pk-toprow">
      <style>{CSS}</style>
      <span className="pk-toprow-l"><HubAinubis /></span>
      {onBack ? <BackButton tone="pale" onClick={onBack} label={backLabel ?? ''} /> : <span />}
      <span className="pk-toprow-r">{right}</span>
    </div>
  );
}
