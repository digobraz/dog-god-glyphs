// ============================================================================
// <RightGate> — prvok, na ktorý PAWMATE nemá právo (B6 / F4)
//
// Zadanie: `plany/zadanie-clenovia-svorky-2026-09-12.md` §6.3.
//
// 🔴 PREČO NIE „VYBLEDNUTÉ A NEKLIKATEĽNÉ". Precedens v repe (`PackTree.tsx:644`,
// zrušené „Add human member") bol `cursor:not-allowed` + vysvetlenie v HOVER
// tooltipe. Na telefóne hover neexistuje ⇒ člen dostane mŕtve tlačidlo bez
// dôvodu — presne to „mŕtve tlačidlo", ktoré má BEH 2 vo výstupnej podmienke.
// Preto prvok ostáva KLIKATEĽNÝ: ťuk naň povie, prečo nejde.
//
// 🔴 PREČO KLONUJEME DIEŤA A NEOBALÍME HO. Obal (aj `display:contents`) mení
// layout — tlačidlo so `width:100%` v mriežke alebo položka vo flexe by sa
// posunuli, a to by znamenalo, že zamknutá obrazovka vyzerá inak než odomknutá.
// Gate preto do dieťaťa len dopíše triedu, zachytí klik a vloží mu zámok ako
// prvé dieťa. Zámok je `<HandLock>` z hand-drawn setu — jedna kópia cesty,
// nie druhá v CSS maske.
//
// ⚠️ TOTO NIE JE OCHRANA. Hranicu drží server (RLS + `security definer` RPC);
// gate len vysvetľuje. Kto sem pridá nový gate, NEMÁ tým zabezpečený zápis —
// pozri `lib/dogRights.ts`.
// ============================================================================
import { cloneElement, isValidElement, type ReactElement, type ReactNode, type MouseEvent } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { PACK_THEME as T } from '@/components/pack/packTheme';
import { HandLock } from '@/components/pack/HandIcons';
import { useMyDogRights } from '@/lib/dogRights';
import type { PawmateRight } from '@/lib/pawmateRights';

/** Vloží sa raz — gate je na jednej obrazovke aj dvadsaťkrát. */
const GATE_CSS = `
.rg-locked,.rg-wrap{
  opacity:.55;
  cursor:pointer;
  position:relative;
}
/* Prerušovaný rám nesie LEN klonovaný prvok. Na obale by stál okolo prvku, ktorý
   svoj rám už má (zlatá pilulka UPRAVIŤ), a dva rámy nad sebou sa nečítajú ako
   "zamknuté", ale ako chyba vykreslenia — odmerané na doklade psa. */
.rg-locked{border:1px dashed ${T.border} !important}
.rg-locked *,.rg-wrap *{pointer-events:none}
/* 🔴 ZÁMOK NEDEDÍ FARBU TEXTU — má vlastný odznak, a je to nález z testu.
   S dedenou farbou zmizol na dlaždici pridávania (svetlý inkoust na papyruse)
   a rovnako by zanikol kdekoľvek, kde je farba textu blízka pozadiu. Papyrusový
   krúžok so zlatým lemom drží tmavý zámok čitateľný na svetlom aj tmavom
   povrchu — a znak zamknutia tým vyzerá naprieč appkou rovnako. */
.rg-lock{
  flex:none;box-sizing:content-box;
  color:${T.inkStrong};background:${T.card};
  border:1px solid ${T.cardEdge};border-radius:999px;padding:2px;
  margin-right:.35em;vertical-align:-0.25em;
}
/* Veľká plocha (fotka psa) — zámok NA nej, nie v riadku textu.
   ⚠️ NIE do rohu: fotka psa je KRUH s orezaním, takže roh štvorca leží mimo
   viditeľnej plochy a zámok tam zmizne (odmerané na doklade psa). Stojí preto
   dolu v strede — vnútri kruhu pri každom pomere strán a mimo očí psa. */
.rg-lock--corner{
  position:absolute;left:50%;bottom:7px;transform:translateX(-50%);
  margin:0;padding:3px;
}
`;

let cssIn = false;
function ensureCss(): void {
  if (cssIn || typeof document === 'undefined') return;
  cssIn = true;
  const el = document.createElement('style');
  el.setAttribute('data-rg', '1');
  el.textContent = GATE_CSS;
  document.head.appendChild(el);
}

export interface RightGateProps {
  /**
   * Ktoré z ôsmich práv tento prvok potrebuje — alebo `'owner'` pre veci, ktoré
   * sa NIKDY nedajú dať (§5: platba, kúpa psa, zmazanie/prevod, označenie psa
   * za mŕtveho, členovia, heslo). Tie sa nepýtajú práva, pýtajú sa vlastníctva,
   * a preto pre ne ani neexistuje zaškrtávatko.
   */
  right: PawmateRight | 'owner' | PawmateRight[];
  /**
   * Pes, ktorého sa zápis týka — pre zápisy viazané na PSA (doklad, fotka,
   * odkaz na WALL, závet). Vynechaj pri zápisoch viazaných na MŇA (výlet,
   * značka, správa): vtedy stačí, že mi právo dal aspoň jeden majiteľ.
   */
  dogId?: string | null;
  /**
   * Kam sa nakreslí zámok. `inline` (predvolené) = pred obsah tlačidla;
   * `corner` = do rohu plochy (fotka psa, dlaždica), kde by v riadku prekážal.
   */
  lock?: 'inline' | 'corner';
  children: ReactNode;
}

export function RightGate({ right, dogId, lock = 'inline', children }: RightGateProps) {
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };
  const rights = useMyDogRights();

  // Pole = STAČÍ JEDNO z nich. Vstup, ktorý vedie k dvom rôznym zápisom (dlaždica
  // „výlet" otvára aj zápis prejdenej trasy, aj jej nakreslenie), by inak zamkol
  // človeka, ktorý má práve to druhé právo.
  const need = Array.isArray(right) ? right : [right];
  const allowed = need.some((r) => (r === 'owner'
    ? rights.isOwner(dogId)
    : dogId === undefined ? rights.canAny(r) : rights.can(dogId, r)));
  if (allowed) return <>{children}</>;

  ensureCss();

  // Meno psa robí vetu konkrétnou („majiteľ Hektora"), ale pri zápisoch
  // viazaných na mňa žiadny konkrétny pes nie je — vtedy ostáva všeobecná.
  const name = dogId ? rights.dogName(dogId) : null;
  const line = name
    ? tx('pack.gate.ownerOf', 'Only {dog}’s owner can change this.').replace('{dog}', name)
    : tx('pack.gate.owner', 'Only the owner can change this.');

  const lockClass = lock === 'corner' ? 'rg-lock rg-lock--corner' : 'rg-lock';

  const explain = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({ title: line });
  };

  // 🔴 KLONOVAŤ SA DÁ LEN DOM ELEMENT. Vlastná komponenta (`<NoteQuickPalette>`)
  // `className` ani `onClickCapture` neprepošle, takže by gate vyzeral zapojený
  // a nerobil by NIČ — a to je horšie než žiadny gate. Vtedy (a pri texte či poli)
  // sa obalí; layout to smie posunúť, lebo inak niet čomu triedu dopísať.
  if (!isValidElement(children) || typeof (children as ReactElement).type !== 'string') {
    return (
      <span className="rg-wrap" onClickCapture={explain} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        <HandLock size={13} className={lockClass} title={line} />
        {children}
      </span>
    );
  }

  const el = children as ReactElement<{ className?: string; children?: ReactNode }>;
  const props: Record<string, unknown> = {
    className: [el.props.className, 'rg-locked'].filter(Boolean).join(' '),
    onClickCapture: explain,
  };
  // Zamknuté pole sa nesmie dať vypísať ani klávesnicou — `pointer-events`
  // v CSS chráni len myš a dotyk. `readOnly` (nie `disabled`): vypnuté pole
  // klik neprijme, takže by vysvetlenie nemal čo spustiť.
  if (isFormField(el)) props.readOnly = true;

  // 🔴 VYPNUTÉ TLAČIDLO KLIK NEPRIJME — a bez kliku sa vysvetlenie nespustí.
  // Presne to je „mŕtve tlačidlo" zo §6.3: prvok, ktorý nejde a nepovie prečo.
  // Zamknuté tlačidlo preto vypnutie STRÁCA; akciu aj tak zachytí `onClickCapture`.
  //
  // ⚠️ ANI `aria-disabled` — a to je nález z testu, nie opatrnosť. Prvok s ním
  // platí za nedostupný (Playwright ho odmietol kliknúť: „element is not enabled"),
  // takže čítačka by ho preskočila a nevidiaci by sa k vysvetleniu nedostal nikdy.
  // Dostupnosť nesie `<title>` zámku: čítačka prečíta dôvod ako súčasť názvu.
  if (typeof el.type === 'string' && el.type === 'button') props.disabled = false;

  // 🔴 DO PRÁZDNEHO ELEMENTU SA DIEŤA VLOŽIŤ NEDÁ — `<input>` ani `<img>` deti
  // nemajú a React by to odmietol. Tam ostáva len stlmenie a prerušovaný rám;
  // zámok povie až vysvetlenie po ťuknutí.
  if (isVoidElement(el)) return cloneElement(el, props);

  return cloneElement(
    el,
    props,
    <HandLock key="rg-lock" size={lock === 'corner' ? 15 : 13} className={lockClass} title={line} />,
    el.props.children,
  );
}

/** `<input>`/`<textarea>`/`<select>` treba naviac zamknúť pre klávesnicu. */
function isFormField(el: ReactElement): boolean {
  return typeof el.type === 'string' && ['input', 'textarea', 'select'].includes(el.type);
}

/** HTML elementy, ktoré nesmú mať deti. */
const VOID_TAGS = ['input', 'img', 'br', 'hr', 'area', 'embed', 'source', 'track', 'wbr'];
function isVoidElement(el: ReactElement): boolean {
  return typeof el.type === 'string' && VOID_TAGS.includes(el.type);
}
