// ════════════════════════════════════════════════════════════════════════════
// KOSTRA AINUBISA — `/pack/ainubis` (2026-09-21)
// ────────────────────────────────────────────────────────────────────────────
// Rozhodnutia 4A + 5A z `plany/nakres-launch-pack-2026-09-21.html` (Matej 21. 9.):
// vlastná obrazovka, sedem svetov so zámkom, banner „stavba pred očami" a chat,
// ktorý už dnes beží naostro. Vedie sem dlaždica na domove (`Gateways`) aj blok
// na `/pack/dogs`.
//
// ⚠️ TOTO NIE JE VAULT. VAULT (maketa `plany/nakres-vault-fasada-v5-2026-09-20.html`)
//    je zámerne MIMO kritickej cesty flipu — Matej 20. 9.: „AINUBIS nie je projekt,
//    ktorý bude ready do launchu, je to len akýsi náhľad a základ, ktorý budeme svet
//    po svete budovať." Kostra je okresané minimum pre 1. vlnu: žiadna nástenka,
//    žiadny rozbalený chat v stĺpcoch, žiadne zvitky.
//
// ⚠️ KÔŠ 1 — „SOM DOMA" (lock `plany/locky/architektura-pack.md` §3). AINUBIS je
//    miesto chrbtice, nie zanorená obrazovka: spodná lišta je VIDNO vždy a šípka
//    späť tu NIE JE. Preto stránka stojí na `PackLayout` ako ostatné miesta a sama
//    si nič na spodok okna nelepí (§4 locku aj pamäť o obsadenom spodnom páse).
//
// ⚠️ ŠAT JE JEHO, NIE PAPYRUS. Do `PAPER_ROUTES` táto routa NEPATRÍ — AINUBIS má
//    vlastnú cyborg paletu (`ainubisSkin.ts`) a papyrus by z neho spravil ďalšiu
//    kartu appky. Čísla farieb sa NEPÍŠU ručne, berú sa z `AINUBIS.*`.
//
// ⚠️ SVETY SÚ KÓPIA REGISTRA Z NÁKRESU, nie nový zoznam. Mená, poradie aj ikonky
//    sedia s `SVETY[]` v nákrese VAULTu v5 (Matej ich vybral 20. 9.). EN mená sú
//    z nákresu launchu; `v-mena` na nástenke ešte beží, takže pri dolaďovaní mien
//    sa mení TENTO zoznam a nákres SPOLU.
//
// ⚠️ IKONKY SÚ MASKA, NIE FILTER. `BrandIcon` tónuje cez `filter:` a to je pre
//    cyan `#5BE0F0` hádaná farba (pamäť `feedback_filter_aproximuje_masku_farbu_presne`).
//    Tu ide o AINUBISOV token, takže `mask-image` + `background` = presný hex.
// ════════════════════════════════════════════════════════════════════════════
import { PackLayout } from '@/components/pack/PackLayout';
import {
  PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI,
} from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { openAinubis } from '@/lib/ainubisBus';
import { useT } from '@/i18n/LanguageContext';
import ainubisHead from '@/assets/ainubis-head.png';

// Sedem svetov. `ic` = hand-drawn ikonka z `public/icons/pack/` — ani jedna nie je
// kreslená pre túto obrazovku, všetky sú v kite (brand: ikonka mimo kitu = dôvod
// vypýtať si kresbu, nie dôvod siahnuť po lucide).
const WORLDS: readonly { key: string; ic: string; en: string }[] = [
  { key: 'dogsPath', ic: 'dogsphinx', en: "Dog's path" },
  { key: 'understanding', ic: 'idea', en: 'Understanding' },
  { key: 'anatomy', ic: 'nose', en: 'Anatomy' },
  { key: 'nutrition', ic: 'bow', en: 'Nutrition' },
  { key: 'prevention', ic: 'vet', en: 'Prevention' },
  { key: 'training', ic: 'bolt', en: 'Training' },
  { key: 'problems', ic: 'alert', en: 'Problems' },
];

// Chat sedí ako ŠTVRTÁ dlaždica v rade (nákres 21. 9.), nie nad mriežkou ani pod
// ňou. Dôvod je obsahový: jediná živá vec má stáť MEDZI zamknutými, inak vyzerá
// obrazovka ako sedem zámkov s tlačidlom odloženým bokom.
const CHAT_AT = 3;

const CSS = `
.akb-hero{
  position:relative; overflow:hidden;
  border-radius:${PACK_R.card}px;
  padding:${PACK_SPACE.xxl}px ${PACK_SPACE.xl}px;
  background:${AINUBIS.surface};
  border:1px solid ${AINUBIS.edge};
  box-shadow:${AINUBIS.panelShadow};
}
/* Holografická mriežka — ten istý motív ako dlaždica na domove (.gw-ainubis::after).
   Je to podsvietený displej, nie čierny obdĺžnik. */
.akb-hero::after{
  content:''; position:absolute; inset:0; pointer-events:none; opacity:0.30;
  background-image:
    linear-gradient(rgba(${AINUBIS.cyanRGB},0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(${AINUBIS.cyanRGB},0.16) 1px, transparent 1px);
  background-size:34px 34px;
  -webkit-mask-image:radial-gradient(120% 90% at 50% 0%, #000 0%, transparent 72%);
  mask-image:radial-gradient(120% 90% at 50% 0%, #000 0%, transparent 72%);
}
.akb-head{
  position:relative; z-index:1;
  display:flex; align-items:center; gap:${PACK_SPACE.lg}px; flex-wrap:wrap;
}
.akb-face{
  width:96px; height:96px; flex:0 0 auto; object-fit:contain;
  border-radius:${PACK_R.pill}px;
  background:${AINUBIS.faceBg}; box-shadow:${AINUBIS.faceRing};
}
.akb-name{
  font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.h1}px; line-height:1;
  letter-spacing:${PACK_HEAD.card.letterSpacing}; text-transform:uppercase;
  color:${AINUBIS.ink}; margin:0;
}
.akb-name i{ font-style:normal; color:${AINUBIS.aiInk}; text-shadow:${AINUBIS.aiShadow}; }
/* Štítok stavu — ŠIROKÝ rozstrelený tvar PACK_HEAD.label (.26em), nie tichý eyebrow
   vnútri karty. Hovorí, že sa stavia pred očami, takže má byť vidieť skôr než text. */
.akb-flag{
  display:block; margin-bottom:${PACK_SPACE.sm}px;
  font-family:${FONT_UI}; font-weight:500; font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.label.letterSpacing}; text-transform:uppercase;
  color:${AINUBIS.cyan};
}
.akb-lead{
  position:relative; z-index:1; margin:${PACK_SPACE.lg}px 0 0;
  font-family:${FONT_UI}; font-size:${PACK_TEXT.lead}px; line-height:1.55;
  color:${AINUBIS.inkDim}; max-width:62ch;
}
/* Dátum otvorenia je SĽUB, preto stojí samostatne a v jeho CTA farbe — nie utopený
   vo vete. Nie je to tlačidlo, takže NEMÁ plnú plochu CTA gradientu (zlato = akcia). */
.akb-when{
  position:relative; z-index:1; display:inline-block; margin-top:${PACK_SPACE.lg}px;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px; border-radius:${PACK_R.pill}px;
  font-family:${FONT_UI}; font-weight:600; font-size:${PACK_TEXT.label}px;
  letter-spacing:0.02em; color:${AINUBIS.ctaA};
  background:${AINUBIS.ctaTint};
  border:1px solid ${AINUBIS.ctaEdge};
}
/* ⚠️ POČET STĹPCOV NIE JE PEVNÝ — rozhoduje ŠÍRKA DLAŽDICE (160 px). Pevné štyri
   stĺpce na PC dali dlaždicu ~150 px a do nej sa „UNDERSTANDING" v Cinzeli s rozstupom
   .14em nezmestí ani pri najmenšom písme z matrice; lámalo sa to na „UNDERSTAN-DING".
   Takto mriežka sama padne na tri stĺpce tam, kde by štyri lámali slová. */
.akb-grid{
  display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
  gap:${PACK_SPACE.md}px; margin-top:${PACK_SPACE.xl}px;
}
.akb-tile{
  position:relative; display:flex; flex-direction:column; align-items:flex-start;
  gap:${PACK_SPACE.sm}px; text-align:left; width:100%;
  padding:${PACK_SPACE.lg}px; border-radius:${PACK_R.tile}px;
  /* ⚠️ DVE VRSTVY, NIE JEDNA. Samotný raised je gradient s krytím 0.07/0.03, takže
     cez dlaždicu presvitala hieroglyfová tapeta PackLayout-u a svet vyzeral ako okno
     do pozadia namiesto zhasnutého displeja (videné na fotke 21. 9., 500 aj 1440 px).
     Preto raised NAD surface: raised ostáva tým, čím je — o stupeň vyššia plocha. */
  background:${AINUBIS.raised}, ${AINUBIS.surface};
  border:1px solid ${AINUBIS.edge};
  box-shadow:${AINUBIS.panelShadow};
}
/* Zamknutý svet je TICHÝ. Nie je to chyba ani nálepka cez roh — je to sľúbený obsah,
   ktorý sa píše. Preto stlmenie, nie prečiarknutie.
   ⚠️ STLMUJE SA OBSAH, NIE DOSKA. opacity na celej dlaždici zprehľadní aj jej
   podklad, takže cez svet presvitala hieroglyfová tapeta stránky (fotka 21. 9.) —
   a displej, cez ktorý vidno stenu za ním, nie je zhasnutý displej, je to diera. */
.akb-tile-locked > *{ opacity:0.72; }
.akb-tile-live{
  border-color:${AINUBIS.edgeStrong};
  background:${AINUBIS.surface};
  cursor:pointer;
  transition:transform 140ms ease;
}
/* Hover nesie IBA transform — box-shadow je jedna vlastnosť a prepísal by celý
   odliatok dlaždice (to isté pravidlo ako pri zlatom ráme v brand locku). */
.akb-tile-live:hover, .akb-tile-live:focus-visible{ transform:translateY(-2px); }
.akb-ic{
  width:32px; height:32px; display:block;
  background:${AINUBIS.cyan};
  -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat;
  -webkit-mask-position:center; mask-position:center;
  -webkit-mask-size:contain; mask-size:contain;
}
.akb-ic-live{ background:${AINUBIS.ctaA}; }
.akb-tile-name{
  font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.label}px; line-height:1.35;
  letter-spacing:${PACK_HEAD.card.letterSpacing}; text-transform:uppercase;
  color:${AINUBIS.ink}; margin:0;
  /* ⚠️ BEZ TOHTO PRETEČIE. Pri štyroch stĺpcoch je dlaždica ~150 px a „UNDERSTANDING"
     v Cinzeli s rozstupom .14em je širšie — na fotke 21. 9. (1440 px) doslova naliehalo
     na ANATOMY v susednej dlaždici. Jedno dlhé slovo sa nemá kde zalomiť, kým mu to
     nedovolíš. Sledovanie sa NEZNIŽUJE: .14em je nadpisový tvar z matrice. */
  overflow-wrap:anywhere;
  min-width:0;
}
.akb-tile-name i{ font-style:normal; color:${AINUBIS.aiInk}; text-shadow:${AINUBIS.aiShadow}; }
.akb-state{
  font-family:${FONT_UI}; font-weight:500; font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.section.letterSpacing}; text-transform:uppercase;
  color:${AINUBIS.inkFaint};
}
.akb-state-live{ color:${AINUBIS.ctaA}; }
.akb-ask{
  margin-top:${PACK_SPACE.xs}px; padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  border-radius:${PACK_R.field}px; border:0;
  font-family:${FONT_UI}; font-weight:700; font-size:${PACK_TEXT.label}px;
  letter-spacing:0.02em; text-transform:uppercase;
  background:${AINUBIS.ctaGrad}; color:${AINUBIS.ctaInk};
  box-shadow:${AINUBIS.ctaShadow};
}
`;

export default function PackAinubis() {
  const t = useT();
  const tx = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  const tiles = WORLDS.map((w) => (
    <div className="akb-tile akb-tile-locked" key={w.key}>
      <span
        className="akb-ic"
        aria-hidden
        style={{
          WebkitMaskImage: `url(/icons/pack/${w.ic}.svg)`,
          maskImage: `url(/icons/pack/${w.ic}.svg)`,
        }}
      />
      <h2 className="akb-tile-name">{tx(`pack.ainubis.world.${w.key}`, w.en)}</h2>
      <span className="akb-state">{tx('pack.ainubis.state.building', 'Building')}</span>
    </div>
  ));

  tiles.splice(
    CHAT_AT,
    0,
    <button className="akb-tile akb-tile-live" key="chat" type="button" onClick={openAinubis}>
      <span
        className="akb-ic akb-ic-live"
        aria-hidden
        style={{
          WebkitMaskImage: 'url(/icons/pack/chat.svg)',
          maskImage: 'url(/icons/pack/chat.svg)',
        }}
      />
      {/* Meno sa NEPREKLADÁ a delí sa v MARKUPE — „AI" je stroj, „NUBIS" strážca. */}
      <h2 className="akb-tile-name">
        <i>AI</i>NUBIS {tx('pack.ainubis.chat', 'chat')}
      </h2>
      <span className="akb-state akb-state-live">{tx('pack.ainubis.state.live', 'Live')}</span>
      <span className="akb-ask">{tx('pack.ainubis.ask', 'Ask AINUBIS')}</span>
    </button>,
  );

  return (
    <PackLayout>
      <style>{CSS}</style>

      {/* ── BANNER — variant A „stavba pred očami" (rozhodnutie 5A, 21. 9.) ────── */}
      <section className="akb-hero">
        <div className="akb-head">
          <img className="akb-face" src={ainubisHead} alt="" aria-hidden />
          <div>
            <span className="akb-flag">
              {tx('pack.ainubis.flag', 'Under construction — in plain sight')}
            </span>
            <h1 className="akb-name"><i>AI</i>NUBIS</h1>
          </div>
        </div>

        <p className="akb-lead">
          {tx(
            'pack.ainubis.lead',
            'AINUBIS is learning. Seven worlds of dog knowledge are being written right now, '
            + 'scroll by scroll. You’ll watch them open one by one.',
          )}
        </p>

        <span className="akb-when">
          {tx('pack.ainubis.opening', 'Expected opening: November 2026')}
        </span>
      </section>

      {/* ── SEDEM SVETOV + CHAT ───────────────────────────────────────────────── */}
      <div className="akb-grid">{tiles}</div>

      {/* ⚠️ SPODNÝ PÁS JE OBSADENÝ VIACKRÁT: plávajúci nav si berie výšku cookie lišty
          (`--consent-h`, publikuje ju `PackLayout`), takže sa nad ňu posunie — a posledný
          rad dlaždíc skončí POD ním. Premerané 21. 9.: pri 500×900 nav leží na poslednej
          dlaždici, hoci `PackLayout` dáva `pb-40`. Preto si odsadenie berie tú istú
          premennú, akú používa nav — nie pevné číslo, ktoré by sa s ním rozišlo.
          (pamäť `feedback_spodny_pas_je_obsadeny_viackrat`) */}
      <div style={{ height: `calc(var(--consent-h, 0px) + ${PACK_SPACE.xxxl}px)` }} />
    </PackLayout>
  );
}
