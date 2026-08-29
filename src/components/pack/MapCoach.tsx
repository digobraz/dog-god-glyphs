// ── SPRIEVODCA PO PRVOM ULOŽENOM VÝLETE (Matej 2026-08-25) ───────────────────────────────
//
// „ak už človek po reveali klikne na späť na mapu, vráti sa na mapu a vtedy ainubis vyskočí,
//  že kde to nájde… tu ainubis povie cestu: tripy nájdeš vo svojom profile, šípka na fotku
//  vľavo hore v headeri. Ostatné je tmavé, do textu napíše že tu nájdeš svoje výlety aj
//  celkové štatistiky, a keď klikne, otvorí sa mu TRIPSTATS."
//
// ⚠️ NAHRÁDZA TEXTOVÝ BLOK, NEPRIDÁVA SA K NEMU. `pack.reveal.coach*` v `TripReveal` POVEDAL,
// kde to je („Výlet sa uložil do Mojich výletov"), ale neukázal to — a veta o mieste, ktoré
// človek nevidí, je to isté ako žiadna veta.
//
// ⚠️ NEPRIDÁVA SA AKCIA. `.trp-midentity` je tlačidlo, ktoré UŽ dnes vedie na
// `/pack/map/triplist?tab=stats`, teda na TRIPSTATS. Sprievodca teda len ukazuje cestu, ktorá
// existuje — človek sa naučí gesto, ktorým pôjde aj nabudúce. Preto sa naň dá kliknúť priamo
// cez dieru v tmavej ploche, nie cez náhradné tlačidlo v bubline.
//
// ⚠️ PRSTENEC JE CYAN, NIE ZLATÝ. Zlatá na tejto obrazovke znamená „tu klikni ty"; keď na
// niečo ukazuje AInubis, hovorí jeho paletou (viď AinubisWidget.css / AinubisGuide).
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ainubisFace from '@/assets/ainubis-head.png';
import { FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { PALE } from '@/components/pack/navGoldSkin';
import { useT } from '@/i18n/LanguageContext';

/** Vzduch okolo zvýrazneného prvku, aby ho prstenec neorezal. */
const PAD = 8;

/**
 * ── „NABUDÚCE NEZOBRAZOVAŤ" (Matej 2026-08-28) ───────────────────────────────────────────
 * „Ešte by tam malo byť tlačidlo alebo text nabudúce nezobrazovať, aby to nemusel riešiť
 *  stále."
 *
 * Sprievodca sa dnes zjaví po KAŽDOM návrate z revealu, teda po každom zapísanom výlete —
 * a kto si zapíše piaty, cestu k triplistu dávno pozná. Voľba je vedomá a vratná len
 * zmazaním údajov prehliadača; preto NIE JE naviazaná na „Rozumiem": to je „prečítal som si
 * to teraz", nie „už mi to nikdy nehovor". Dve rôzne odpovede, dve tlačidlá.
 *
 * ⚠️ Ukladá sa LOKÁLNE, nie do profilu — je to vlastnosť tohto zariadenia, rovnako ako
 * nápoveda o písaní po mape (`hintSeen` v AddMapNote.tsx), z ktorej je vzor prevzatý.
 * Privátne okno vráti `false`, teda sprievodcu ukáže — to je bezpečný smer.
 */
const MUTE_KEY = 'dogypt.mapCoach.muted.v1';
export const coachMuted = (): boolean => {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
};
export const muteCoach = (): void => {
  try { localStorage.setItem(MUTE_KEY, '1'); } catch { /* privátne okno — sprievodca sa ukáže znova */ }
};

export function MapCoach({ targetSel, onDone }: { targetSel: string; onDone: () => void }) {
  const t = useT();
  const [box, setBox] = useState<DOMRect | null>(null);

  /**
   * ⚠️ ODCHOD SA HLÁSI Z MERANIA, NIE ZO STAVU (oprava 2026-08-28).
   *
   * Stál tu druhý effect `if (box === null) onDone()`. Vyzeral neškodne („cieľ sa nenašiel,
   * preskoč"), lenže `box` je pri PRVOM renderi null VŽDY — meranie ho nastaví až v ďalšom.
   * Effekty bežia v poradí deklarácie, takže ten druhý videl počiatočnú nulu, ohlásil odchod
   * a PackMap sprievodcu odmountoval skôr, než sa stihol prvýkrát vykresliť.
   *
   * ⚠️ DÔSLEDOK: MapCoach sa od svojho vzniku (25. 8.) NIKDY NEUKÁZAL. Nevšimlo sa to preto,
   * že na jeho mieste hovorila vlastná bublina revealu (`rv-coach`) — tá zanikla 28. 8. práve
   * ako duplicita, a až tým sa ukázalo, že za ňou nič nestojí.
   * Poučenie: „preskoč sa" nikdy neviaž na počiatočnú hodnotu stavu — patrí tam, kde sa naozaj
   * meria.
   *
   * `onDone` drží ref, aby sa effect nespúšťal pri každom renderi rodiča (prop je nová funkcia
   * zakaždým) — inak by meranie bežalo donekonečna.
   */
  const doneRef = useRef(onDone);
  /** ešte neprebehlo úspešné meranie — len dovtedy sa smie sprievodca sám preskočiť */
  const firstRef = useRef(true);
  useEffect(() => { doneRef.current = onDone; }, [onDone]);

  // ⚠️ MERIA SA AŽ PO VYKRESLENÍ A ZNOVA PRI ZMENE OKNA. Hlavička mapy mení šírku s oknom
  // (pilulky sa preskladajú), takže diera zapamätaná raz by po otočení telefónu sedela vedľa.
  useEffect(() => {
    const measure = () => {
      // ⚠️ PRVÝ VIDITEĽNÝ, NIE PRVÝ V DOM-e. Cieľ býva v appke dvakrát — raz v PC lište, raz
      // v mobilnej hlavičke — a tá druhá je skrytá cez `display:none`. `querySelector` by
      // vrátil ten skrytý s rozmerom 0×0, teda dieru v prázdnom rohu obrazovky.
      const el = [...document.querySelectorAll(targetSel)]
        .find((n) => { const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      // ⚠️ ODÍSŤ SA SMIE LEN PRI PRVOM MERANÍ. Cieľ, ktorý pri mounte neexistuje, naozaj
      // neexistuje (iná vetva navigácie) — vtedy je lepšie sprievodcu preskočiť než kresliť
      // dieru v prázdnom rohu. Ale meranie beží aj pri KAŽDEJ zmene okna, a tam môže prísť
      // do chvíle, keď sa lišta práve preskladáva a tlačidlo má nulový rozmer. Odchod v tom
      // okamihu zhasne sprievodcu človeku, ktorý si len zmenil veľkosť okna (odchytené
      // naživo 28. 8.: bublina zmizla pri zmene šírky).
      if (!el) { if (firstRef.current) doneRef.current(); return; }
      firstRef.current = false;
      setBox(el.getBoundingClientRect());
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, [targetSel]);

  if (!box) return null;

  const top = Math.max(4, box.top - PAD);
  const left = Math.max(4, box.left - PAD);
  const w = box.width + PAD * 2;
  const h = box.height + PAD * 2;
  // Bublina ide POD zvýraznený prvok, keď je hore (a naopak) — nikdy ho neprekryje.
  const below = top < window.innerHeight / 2;

  /**
   * ── BUBLINA MÁ ŠÍRKU KARTY, NIE OKNA (Matej 2026-08-28) ────────────────────────────────
   * „Tá jeho bublina nemusí byť preboha na celú šírku PC! Urob to adekvátne a peknú menšiu
   *  bublinku v peknom dizajne, ale s pekným rozložením."
   * Dovtedy mala `left:12px; right:12px`, čo je na telefóne správne a na 1600 px monitore
   * z nej spraví pás cez celú obrazovku s dvoma slovami uprostred.
   * Šírka je zhodná s dblokom revealu (430) — je to tá istá vetva rozhovoru o jednu
   * obrazovku ďalej. Poloha sa VIAŽE NA CIEĽ: bublina stojí pod ním a smie sa hýbať len
   * toľko, aby nevytiekla z okna — inak by šípka ukazovala inam než na svoj prvok.
   */
  const bw = Math.min(430, window.innerWidth - 24);
  const bubbleLeft = Math.min(
    Math.max(12, left + w / 2 - bw / 2),
    Math.max(12, window.innerWidth - bw - 12),
  );

  return createPortal(
    <div className="mcoach" role="dialog" aria-modal="true" onClick={onDone}>
      <style>{MAP_COACH_CSS}</style>
      {/* Diera v tme je box-shadow, nie štyri obdĺžniky okolo — pri zmene rozmerov sa
          nemá čo rozísť. `pointer-events:none` na nej: ťuk do diery patrí prvku pod ňou. */}
      <div className="mcoach-hole" style={{ top, left, width: w, height: h }} />
      <div
        className="mcoach-bubble"
        style={{ left: bubbleLeft, width: bw, ...(below ? { top: top + h + 14 } : { bottom: window.innerHeight - top + 14 }) }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={`mcoach-arrow${below ? ' up' : ' down'}`} style={{ left: Math.min(Math.max(left + w / 2, 28), window.innerWidth - 28) }} aria-hidden="true" />
        <img className="mcoach-face" src={ainubisFace} alt="" aria-hidden="true" />
        <div className="mcoach-txt">
          <b>{t('pack.mapCoach.title')}</b>
          <p>{t('pack.mapCoach.body')}</p>
        </div>
        {/* PÄTA — tichý odkaz vľavo, odpoveď vpravo. „Rozumiem" je to, čo appka očakáva;
            vypnutie je výnimka a nesmie s ním súperiť o pozornosť (vzor `.rv-sumlink`). */}
        <div className="mcoach-foot">
          <button type="button" className="mcoach-mute" onClick={() => { muteCoach(); onDone(); }}>
            {t('pack.mapCoach.mute')}
          </button>
          <button type="button" className="mcoach-ok" onClick={onDone}>{t('pack.mapCoach.ok')}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export const MAP_COACH_CSS = `
/* ── PLOCHA OKOLO JE BLEDÁ, NIE TMAVÁ (Matej 2026-08-28, druhé kolo) ────────────────────
   „Myslel som pozadie — to, čo je teraz modré (celá obrazovka), daj bledé, a AInubisovu
    bublinu nechaj v brande, ako bola. CTA si dal správne."

   Prvé čítanie zadania („celú stránku daj do tmavomodrej") som spravil doslova a stmavil
   som plochu; Matej mieril na to, že plocha má byť SVETLÁ — mapa má ustúpiť do papyrusu,
   nie do noci. Bublina je opak: tá ostáva tmavá, lebo je to AInubisov hlas a jeho paleta.
   Kontrast tým sedí na oboch stranách — tmavá bublina na svetlej ploche, svetlý prvok
   (Triplist) vo výreze.
   ⚠️ Krytie je vysoké (0.90): pod tým je farebná OSM mapa a pri nižšom presvitá do textu. */
.mcoach{position:fixed;inset:0;z-index:1500;}
.mcoach-hole{position:fixed;border-radius:14px;pointer-events:none;box-shadow:0 0 0 9999px rgba(249,242,226,0.90),0 0 0 2px ${PALE.edge},0 0 22px rgba(201,154,63,0.45);animation:mcoach-ring 2.2s ease-in-out infinite;}
@keyframes mcoach-ring{
  0%,100%{box-shadow:0 0 0 9999px rgba(249,242,226,0.90),0 0 0 2px rgba(201,154,63,0.70),0 0 18px rgba(201,154,63,0.35);}
  50%{box-shadow:0 0 0 9999px rgba(249,242,226,0.90),0 0 0 3px ${PALE.edge},0 0 30px rgba(201,154,63,0.60);}
}
/* ── BUBLINA OSTÁVA V AINUBISOVOM BRANDE (Matej 2026-08-28: „AInubisovu bublinu nechaj
   v brande! ako bola") ──────────────────────────────────────────────────────────────────
   Tmavý modrý podklad, cyan rám a dosvit — presne ako .ang-bar v AinubisGuide, teda
   všade, kde hovorí on. Papyrusová verzia bola omyl v čítaní zadania (ono mierilo na
   plochu okolo, viď .mcoach-hole vyššie) a zároveň by z jeho hlasu spravila hlas appky.

   ⚠️ ČO Z PREDOŠLÉHO KOLA ZOSTÁVA, LEBO TO MATEJ POCHVÁLIL: šírka karty (430, nie celé
   okno — „nemusí byť preboha na celú šírku PC"), poloha viazaná na cieľ, rozloženie
   hlava + text a päta s tichým odkazom vľavo a odpoveďou vpravo. */
.mcoach-bubble{position:fixed;display:grid;grid-template-columns:auto 1fr;gap:11px 12px;
  padding:14px 14px 12px;border-radius:15px;
  background:radial-gradient(120% 160% at 50% -40%,rgba(59,158,255,0.20) 0%,rgba(59,158,255,0) 62%),linear-gradient(180deg,#071019 0%,#03070C 100%);
  border:1.5px solid rgba(91,224,240,0.55);
  box-shadow:0 0 0 3px rgba(59,158,255,0.20),0 0 30px rgba(59,158,255,0.42),0 14px 40px rgba(0,0,0,0.45);}
.mcoach-arrow{position:fixed;width:0;height:0;margin-left:-9px;border-left:9px solid transparent;border-right:9px solid transparent;}
.mcoach-arrow.up{margin-top:-9px;border-bottom:9px solid rgba(91,224,240,0.75);}
.mcoach-arrow.down{margin-top:0;border-top:9px solid rgba(91,224,240,0.75);}
.mcoach-face{flex:0 0 auto;width:46px;height:46px;object-fit:contain;border-radius:50%;background:radial-gradient(circle at 35% 28%,#12233a 0%,#01050A 74%);box-shadow:0 0 0 1.5px rgba(91,224,240,0.45),0 0 16px rgba(59,158,255,0.38);}
.mcoach-txt{min-width:0;}
.mcoach-txt b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;color:#E6FAFF;margin-bottom:4px;}
.mcoach-txt p{margin:0;font-family:${FONT_UI};font-size:12.5px;line-height:1.45;color:rgba(207,243,250,0.82);}
.mcoach-foot{grid-column:1 / -1;display:flex;align-items:center;justify-content:space-between;gap:12px;}
.mcoach-mute{padding:0 0 1px;background:none;border:0;cursor:pointer;
  font-family:${FONT_UI};font-size:11px;color:rgba(207,243,250,0.55);
  border-bottom:1px dotted currentColor;}
.mcoach-mute:hover{color:#E6FAFF;}
/* ⚠️ CTA JE AINUBISOVO ZLATO-ORANŽOVÉ, NIE LAPIS — VÝNIMKA Z BRANDOVÉHO KÁNONU
   (Matej 2026-08-28: „Rozumiem môže byť v oranžovom prevedení, AINUBIS je výnimka! Je to
   jeho brand", potvrdené v ďalšom kole: „CTA si dal správne"). Lapis je hlas APPKY („čo
   urobím ja"); táto bublina je hlas SPRIEVODCU a nesie jeho paletu. Gradient nie je nový —
   je to presne ten, ktorý má AInubisov widget pre svoje tlačidlá (AinubisWidget.css). */
.mcoach-ok{flex:0 0 auto;padding:10px 18px;border-radius:8px;cursor:pointer;
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30);color:#2a1608;
  box-shadow:0 4px 14px -4px rgba(230,158,26,0.55),inset 0 1px 0 rgba(255,255,255,0.30);
  font-family:${FONT_TITLE};font-weight:700;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;}
.mcoach-ok:hover{background:linear-gradient(135deg,#FFD65A 0%,#F0A81E 100%);}
`;
