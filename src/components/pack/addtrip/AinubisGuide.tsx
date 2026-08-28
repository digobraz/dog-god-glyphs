// AINUBIS — SPRIEVODCA NAD MAPOU (Matej 24. 8. 2026)
//
// „ideme aplikovať AInubisa = namiesto fialových pils dáme ikonku ainubisa a textové pole
//  ktoré sa bude meniť, bude to vyzerať ako keby písal online = bude sledovať dianie…
//  Vyhľadaj miesto kde ste boli a priblíž sa, ešte, ešte super - teraz zvoľ štartovací bod:
//  dlhým stlačením zaháj trasu na mieste kde si s turistikou začali."
//
// ⚠️ TOTO NAHRÁDZA FIALOVÚ PILULKU, NEPRIDÁVA SA K NEJ. Dva systémy pokynov na jednej
// obrazovke sú presne to, čo lock z 23. 8. zakazoval — mení sa NOSIČ, nie pravidlo. Pilulka
// bola bezmenná hláška systému; toto je niekto, kto sa pozerá a hovorí. Preto sa text
// PÍŠE (a nie prebliskne): písanie je jediné, čo z výmeny textu spraví reakciu na to, čo
// človek práve spravil.
//
// ⚠️ NIE JE TO CHAT. `AinubisWidget` (root singleton, `lib/ainubisBus.ts`) je rozhovor
// s modelom; toto je sprievodca s pevnou sadou viet zo slovníka — žiadna sieť, žiadna
// odpoveď od človeka. Keby to volalo model, prvý pokyn by prišiel s oneskorením siete
// presne vo chvíli, keď človek drží prst nad mapou a čaká.
import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import ainubisFace from '@/assets/ainubis-head.png';
import { PACK_THEME as T, FONT_UI } from '@/components/pack/packTheme';

/** ms na znak — 22 je rýchlosť, pri ktorej sa veta stihne prečítať skôr, než dopíše. */
const CHAR_MS = 22;

export function AinubisGuide({
  text,
  onAbort,
  abortLabel,
  below,
  edgeLeft,
}: {
  /** celá veta; pri zmene sa prepíše nanovo (to je tá „reakcia") */
  text: string;
  onAbort?: () => void;
  abortLabel?: string;
  /** bodky 1–5 — stoja POD bublinou, nie v paneli (Matej 24. 8. 2026) */
  below?: React.ReactNode;
  /**
   * Na PC stojí bublina vpravo od ľavého panela (left:480px). Keď ten panel v danej chvíli
   * NIE JE na obrazovke — a to je presne krok 2 sprievodcu, kde formulár ustúpi mape —
   * ostane bublina visieť uprostred ničoho (Matej 2026-08-27: „je ako keby v strede").
   * Tento príznak ju prisadí k ľavému okraju mapy.
   */
  edgeLeft?: boolean;
}) {
  const [shown, setShown] = useState('');
  const [typing, setTyping] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearInterval(timer.current);
    if (!text) { setShown(''); setTyping(false); return; }
    // ⚠️ REŽIM OBMEDZENÉHO POHYBU: efekt je ozdoba, obsah nie. Kto ho má vypnutý, dostane
    // vetu naraz — nie žiadnu.
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShown(text); setTyping(false); return; }
    setShown('');
    setTyping(true);
    let i = 0;
    timer.current = window.setInterval(() => {
      i += 1;
      // slice, NIE zreťazenie po znakoch: pri rýchlej výmene textov by sa dva behy
      // prepletali do jednej vety a vznikol by zlepenec z oboch.
      setShown(text.slice(0, i));
      if (i >= text.length) { window.clearInterval(timer.current); setTyping(false); }
    }, CHAR_MS);
    return () => window.clearInterval(timer.current);
  }, [text]);

  return (
    <div className={`ang-wrap${edgeLeft ? ' ang-wrap--edge' : ''}`}>
      <style>{AINUBIS_GUIDE_CSS}</style>
      <div className="ang-bar">
        <img className="ang-face" src={ainubisFace} alt="" aria-hidden="true" />
        {/* aria-live: pokyn sa mení bez toho, aby sa čokoľvek prekliklo — bez tohto by
            o ňom čítačka obrazovky nevedela. Číta sa CELÁ veta (text), nie rozpísaná. */}
        <p className="ang-text" aria-live="polite">
          {/* ⚠️ KRÍŽIK JE VNÚTRI ODSEKU A OBTEKÁ SA (Matej 2026-08-25: „na pravej strane
              bubliny už nejde text"). Ako súrodenec vo flexe si rezervoval svoj stĺpec na
              KAŽDOM riadku, hoci je potrebný len pri prvom — veta sa tým zbytočne predlžovala
              o riadok. Float ho nechá stáť v rohu a text pod ním využije plnú šírku.
              V DOM stojí pred textom zámerne: čítačka ohlási východisko skôr, než začne
              čítať dlhý pokyn. */}
          {onAbort && (
            <button type="button" className="ang-x" onClick={onAbort} aria-label={abortLabel} title={abortLabel}>×</button>
          )}
          <span aria-hidden="true">{shown}</span>
          {typing && <i className="ang-caret" aria-hidden="true" />}
          <span className="ang-sr">{text}</span>
        </p>
      </div>
      {/* ⚠️ BODKY SÚ POD BUBLINOU, NIE V PANELI (Matej 24. 8. 2026: „tie kroky 1-5 v 1. a 2.
          kroku presuňme pod bublinu ainubisa, tam nám nebudú zavadzať"). V paneli si delili
          riadok s chipmi značiek a tlačili CTA k hornej hrane. Hore majú vlastný riadok nad
          mapou a panel ostáva len na úlohu kroku. */}
      {below && <div className="ang-below">{below}</div>}
    </div>
  );
}

export const AINUBIS_GUIDE_CSS = `
/* Pás je nad mapou a MUSÍ prepúšťať ťuky mimo seba — inak vznikne hore pruh, kde sa nedá
   kresliť (tá istá príčina, akú mal pôvodný .trp-dtop). */
/* ⚠️ NELEPIŤ NA HORNÚ HRANU (Matej 24. 8. 2026: „pri prvom kroku je ainubis moc pri hornom
   okraji"). Nad ním je stavový riadok telefónu (hodiny, batéria) a bez odstupu z toho bol
   jeden zlepený pruh. env(safe-area-inset-top) rieši NOTCH, nie odstup — to je ďalších
   28 px navyše, aby bublina vyzerala, že visí NAD mapou, nie že je prilepená k systému. */
.ang-wrap{position:fixed;left:0;right:0;top:0;z-index:1202;padding:calc(28px + env(safe-area-inset-top,0px)) 12px 14px;pointer-events:none;background:linear-gradient(180deg,rgba(3,7,12,0.92) 62%,rgba(3,7,12,0));}
/* ⚠️ BUBLINA MUSÍ ŽIARIŤ (Matej 24. 8.: „jeho bublina musí žiariť a musí byť viditeľný").
   Prvé kolo malo halo 4 px pri 14 % krytí — na svetlej turistickej mape to zaniklo rovnako
   ako predtým fialová pilulka. Preto nesie DVA dosvity: tesný prstenec (obrys) a široký
   závoj (svetlo), plus pomalé dýchanie, aby ju oko našlo aj bez pohybu.
   ⚠️ FARBA JE AINUBISOVA TMAVOMODRÁ, NIE ZLATÁ (Matej 25. 8. 2026: „ainubis musí mať modrú
   farbu bubliny ako má v brande"). Hodnoty NIE SÚ vymyslené — sú zdvihnuté 1:1 z jeho
   živého povrchu 'components/ainubis/AinubisWidget.css' (panel: studená čierna
   #071019→#03070C + modrý svit zhora, rám a text cyan #5BE0F0). Dôvod, prečo to nie je
   "T.brandBlue": egyptská modrá na TEJTO obrazovke už nesie iný význam — modrým lemom
   appka značí udalosti a „ideš s niekým" ("EVENT_RIM", CLAUDE.md), takže by sprievodca
   splynul so značkami na mape pod ním. AInubis má vlastnú modrú a tá je tu tá správna. */
.ang-bar{pointer-events:auto;display:flex;align-items:center;gap:10px;padding:9px 6px 9px 9px;border-radius:15px;background:radial-gradient(120% 160% at 50% -40%,rgba(59,158,255,0.20) 0%,rgba(59,158,255,0) 62%),linear-gradient(180deg,#071019 0%,#03070C 100%);backdrop-filter:blur(10px);border:1.5px solid rgba(91,224,240,0.55);box-shadow:0 0 0 3px rgba(59,158,255,0.22),0 0 26px rgba(59,158,255,0.42),0 10px 30px rgba(0,0,0,0.62);animation:ang-glow 3.4s ease-in-out infinite;}
@keyframes ang-glow{
  0%,100%{box-shadow:0 0 0 3px rgba(59,158,255,0.20),0 0 22px rgba(59,158,255,0.32),0 10px 30px rgba(0,0,0,0.62);}
  50%{box-shadow:0 0 0 3px rgba(59,158,255,0.34),0 0 40px rgba(59,158,255,0.60),0 10px 30px rgba(0,0,0,0.62);}
}
/* ⚠️ TVÁR JE V KRUHU, NIE V ŠTVORCI (Matej 25. 8. 2026: „jeho ikonka musí byť v krúžku,
   kludne ho o niečo zväčši"). Kruh nie je vkus — je to tvar, ktorý AInubis má všade inde:
   plávajúce tlačidlo aj intro odznak vo widgete sú 'border-radius:50%'. Zaoblený štvorec
   tu bol jediné miesto v celej appke, kde mal inú siluetu.
   Obrázok je 800×940 (vyšší než širší), takže 'object-fit:contain' ho v kruhu nechá dýchať
   — 'cover' by mu odrezal uši. */
.ang-face{flex:0 0 auto;width:48px;height:48px;object-fit:contain;border-radius:50%;background:radial-gradient(circle at 35% 28%,#12233a 0%,#01050A 74%);box-shadow:0 0 0 1.5px rgba(91,224,240,0.45),0 0 16px rgba(59,158,255,0.38);}
.ang-text{flex:1 1 auto;min-width:0;margin:0;font-family:${FONT_UI};font-size:13px;font-weight:500;line-height:1.35;color:#E6FAFF;}
/* Kurzor bliká LEN kým sa píše — blikanie nad dopísanou vetou by tvrdilo, že ešte príde
   pokračovanie. */
.ang-caret{display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-2px;background:#5BE0F0;animation:ang-blink .9s steps(1,end) infinite;}
@keyframes ang-blink{0%,49%{opacity:1;}50%,100%{opacity:0;}}
.ang-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.ang-x{float:right;width:30px;height:26px;margin:-2px -2px 0 6px;border:0;background:transparent;color:${T.onDarkDim};font-size:19px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;}
.ang-x:hover{color:#5BE0F0;}
/* Riadok pod bublinou. Ťuky berie len on sám, nie celý pás — pod ním sa musí dať kresliť. */
.ang-below{margin-top:9px;pointer-events:auto;}
@media (prefers-reduced-motion: reduce){
  .ang-caret{animation:none;}
  .ang-bar{animation:none;}
}
/* PC — dok je ľavý stĺpec, takže sprievodca stojí nad MAPOU vpravo od neho, nie cez celú
   šírku okna. Čísla sú tie isté, aké drží .trp-dtop, aby sa pásy neprekrývali. */
@media (min-width:900px){
  /* ⚠️ NA PC ŽIADNY ZÁVOJ (Matej 2026-08-27: „jeho blok je chybný… je ako keby v strede
     a má za sebou aj okolo divný overlay"). Tmavý prechod je stavaný pre TELEFÓN, kde
     bublina leží priamo na mape pod stavovým riadkom a bez neho by sa strácala. Na PC
     ju drží vlastný modrý dosvit — závoj z nej robil pás cez pol obrazovky.
     ⚠️ V toku pridávania výletu to nebolo vidieť: tam sprievodcu hostí ľavý stĺpec
     (.trp-dock--pc .ang-wrap, ktorý pozadie ruší). Vidieť to bolo len tam, kde ho
     renderuje niekto INÝ — MapNotePlacing pri označovaní odkazu. Preto sa to ruší TU,
     pri zdroji, a nie ďalším prepisom u volajúceho.
     ⚠️ Bublina sa NEROZŤAHUJE na celú šírku mapy. left:480px;right:74px z nej robilo
     pás, ktorý sa čítal ako vycentrovaný panel; s hornou hranicou šírky stojí pri ľavom
     okraji mapy, teda hneď vedľa panela, z ktorého tok vyšiel. */
  .ang-wrap{left:480px;right:74px;padding-top:18px;background:none;}
  /* Panel v tejto chvíli na obrazovke nie je — mapa začína pri okraji okna a bublina s ňou. */
  .ang-wrap--edge{left:0;padding-left:16px;}
  .ang-bar{max-width:560px;}
  .ang-face{width:54px;height:54px;}
  .ang-text{font-size:14px;}
}
@media (min-width:900px) and (max-width:1100px){
  .ang-wrap{left:400px;}
}
`;
