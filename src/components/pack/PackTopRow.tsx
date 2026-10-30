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
// 🔁 STICKY NA HLADKOM PAPYRUSE (TEST_BUILD, Matej 25. 10. 2026: *„nechajme sticky horný panel s ainubisom
//    a upozorneniami, bude to lepšie"*). Dôvod zákazu vyššie bol chýbajúci podklad — na `.pk-plain`
//    (profily, psy, DOG ID) ho rad dostane: papyrusový pás cez celé okno od hornej hrany po medzeru pod
//    radom + krátke rozplynutie, pod ktoré obsah zajde. Tmavé obrazovky ostávajú v toku.
// ⚠️ `translate`, nie `transform` — hover kolieska píše `transform` a dedenie sa nesmie biť.
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { HubAinubis, PackNotifications } from './PackNotifications';
import { BackButton } from './BackButton';
import { SosButton } from './SosButton';
import { PACK_TOPROW, PACK_COL_INNER, PACK_COL_PAD, PAPER_BG, PACK_SPACE, usePaperRoute } from './packTheme';
import { DEV_FULL } from '@/lib/packFlags';
import { TEST_BUILD } from '@/lib/env';
import { getPackStats } from '@/lib/sharedFetch';

// ── JEDNA HLAVIČKA (Matej 28. 10. 2026) ──────────────────────────────────────────────────
// *„header musí mať stálu výšku a umiestnenie, ikonky nemôže mať každá obrazovka iné. Výnimkou je
//  /map a VAULT (iná štruktúra), ale obsah (ikonky) by mal byť aj tam v jednej úrovni."*
// Os ikoniek = `PACK_TOPROW.axis` (od safe-area). Pravý kraj (správy + upozornenia) je na KAŽDEJ obrazovke
// rovnaký — `right` sa už nenahrádza, len dopĺňa (`extra` stojí vľavo od správ). Dovtedy mal SNIFFER na
// pravom kraji ozubené koliesko, kvízy, triplist a príbeh nič a ikonky sedeli o 2 px nižšie (rad mal
// pevných 40 px, pravý slot 44 a mriežka ho zarovnala na začiatok stopy).
function TopRowRight({ extra }: { extra?: ReactNode }) {
  const paper = usePaperRoute(useLocation().pathname);
  const [stats, setStats] = useState<{ last24h: number | null; total: number | null }>({ last24h: null, total: null });
  useEffect(() => {
    let alive = true;
    getPackStats<{ total?: number; dogs?: number; last24h?: number }>().then((j) => {
      if (!alive) return;
      const n = typeof j?.dogs === 'number' ? j.dogs : j?.total;
      setStats({ total: typeof n === 'number' ? n : null, last24h: typeof j?.last24h === 'number' ? j.last24h : null });
    }).catch(() => {});
    return () => { alive = false; };
  }, []);
  return (
    <>
      {extra}
      {/* SOS vedľa správ (Matej 30. 10. 2026) — zatiaľ len testovacia appka; LIVE až po jeho „ok“. */}
      {TEST_BUILD && <SosButton />}
      {DEV_FULL && <PackNotifications dark={!paper} last24h={stats.last24h} total={stats.total} layout="inline" capsule />}
    </>
  );
}

const CSS = `
.pk-toprow{position:relative;z-index:30;
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;box-sizing:border-box;
  height:${PACK_TOPROW.h}px;grid-template-rows:${PACK_TOPROW.h}px;margin-bottom:${PACK_TOPROW.content - PACK_TOPROW.top - PACK_TOPROW.h}px;
  width:min(${PACK_COL_INNER}px, calc(100vw - ${2 * PACK_COL_PAD.mobile}px));margin-left:50%;translate:-50% 0;
  pointer-events:none;}
@media (min-width:640px){.pk-toprow{width:min(${PACK_COL_INNER}px, calc(100vw - ${2 * PACK_COL_PAD.desktop}px));}}
/* Arabčina (dir=rtl): margin-left:50% + translate:-50% v RTL ujde o ~93 px za ľavý okraj
   a stránka dostane vodorovný scroll (UI audit jazykov 15. 10. 2026) — zrkadlový tvar. */
.pk-plain .pk-toprow{position:sticky;top:calc(env(safe-area-inset-top, 0px) + ${PACK_TOPROW.top}px);}
.pk-plain .pk-toprow::before{content:'';position:absolute;z-index:-1;pointer-events:none;left:50%;width:100vw;margin-left:-50vw;
  top:calc(-1 * (env(safe-area-inset-top, 0px) + ${PACK_TOPROW.top}px));bottom:-${PACK_TOPROW.content - PACK_TOPROW.top - PACK_TOPROW.h}px;background:${PAPER_BG};}
.pk-plain .pk-toprow::after{content:'';position:absolute;z-index:-1;pointer-events:none;left:50%;width:100vw;margin-left:-50vw;
  top:calc(100% + ${PACK_TOPROW.content - PACK_TOPROW.top - PACK_TOPROW.h}px);height:${PACK_TOPROW.top}px;background:linear-gradient(180deg, ${PAPER_BG}, transparent);}
[dir=rtl] .pk-toprow{margin-left:0;margin-right:50%;translate:50% 0;}
.pk-toprow > *{pointer-events:auto;}
.pk-toprow-l{justify-self:start;display:flex;align-items:center;gap:${PACK_SPACE.md}px;}
.pk-toprow-r{justify-self:end;display:flex;align-items:center;gap:${PACK_SPACE.xs}px;}
`;

export function PackTopRow({ onBack, backLabel, right, extra, left }: {
  /** Bez `onBack` je stred prázdny (homepage, DOG ID, profil). */
  onBack?: () => void;
  backLabel?: string;
  /** Prepíše pravý kraj CELÝ (správy + upozornenia). Nepoužívať — obrazovka s iným pravým krajom je presne to, čo lock zakázal. */
  right?: ReactNode;
  /** Doplnok vľavo od správ a upozornení — nastavenia SNIFFERu… Správy a upozornenia ostávajú vždy. */
  extra?: ReactNode;
  /** Vedľa AINUBISA vľavo — FEED 2 tu má lupu (Matej 26. 10. 2026: lupa vedľa AINUBISA, nie pri správach). */
  left?: ReactNode;
}) {
  return (
    <div className="pk-toprow">
      <style>{CSS}</style>
      <span className="pk-toprow-l"><HubAinubis />{left}</span>
      {onBack ? <BackButton tone="pale" onClick={onBack} label={backLabel ?? ''} /> : <span />}
      <span className="pk-toprow-r">{right ?? <TopRowRight extra={extra} />}</span>
    </div>
  );
}
