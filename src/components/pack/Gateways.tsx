// Gateways — TRETÍ riadok homepage `/pack` (Matej 2026-08-09: „3 riadok rozdel na dva
// bloky – DOGMA a ANUBIS").
//
// Dva bloky vedľa seba, ZRKADLOVO otočené — obrázky sedia na VONKAJŠÍCH okrajoch riadku,
// texty vnútri:
//     [ 📕 obrázok | DOGMA text ]   [ AINUBIS text | 🐕‍🦺 obrázok ]
// Matej: „lavy blok daj obrázok DOGMY nalavo a nadpis a text napravo a napravo zasa
// opačne aby boli obrázky a texty presne na opak (obrázky po bokoch)".
//
// MOBIL: bloky ostávajú VEDĽA SEBA (nezalamujú sa pod seba) — na to sa mení kompozícia:
// obrázok prestane byť stĺpec vedľa textu a stane sa VÝREZOM na pozadí karty, väčším než
// karta sama. Rovnaký princíp ako guľa v `TripSpotlight` (Matej: „nebudú vidieť celé
// obrázky, budú veľké — niečo podobné ako planétka").
//
// NAHRÁDZA `QuickTiles` (pás MAPA · DOGMA · AINUBIS). `QuickTiles.tsx` sa NEMAZAL, parkuje
// ako `PackTree`/`DailyPrayers`/`NextTripCard`.
// ⚠️ Dlaždica MAPA tým z homepage odišla — nie je to diera: na mapu vedie celá pravá karta
//    bloku 2 (`TripSpotlight`, nadpis „Preskúmaj mapu") a obe sú aj tak za `DEV_FULL`.
//    Keby `TripSpotlight` z homepage niekedy odišiel, MAPA sa sem musí vrátiť.
//
// Dizajn = papyrus lock (Entry.tsx): `T.cardGrad` · 1.5px `T.cardEdge` · radius 16 ·
// `T.cardShadow`. Nadpis Cinzel 700 uppercase, text Space Grotesk — dva fonty, nie jeden.
import { PACK_THEME, FONT_TITLE, FONT_UI } from './packTheme';
import { markConstitutionOpened } from '@/lib/constitutionRead';
import { openAinubis } from '@/lib/ainubisBus';
import { useT } from '@/i18n/LanguageContext';
import ainubisBadge from '@/assets/ainubis-badge.png';

const T = PACK_THEME;

// ⚠️ JS template literal — spätný apostrof v CSS komentári zhodí build a `tsc` to nechytí.
// ⚠️ JEDNA hranica mobil/desktop: 720 / 721 px. Dve rôzne (napr. 720 pre kompozíciu a 768
//    pre typografiu) vyrobia pásmo šírok, kde neplatí ani jedno pravidlo.
const CSS = `
.gw-row{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (min-width:721px){ .gw-row{ gap:20px; } }

.gw{
  position:relative; overflow:hidden; display:flex; align-items:center;
  min-height:196px; border-radius:16px; padding:22px 22px;
  background:${T.cardGrad}; border:1.5px solid ${T.cardEdge}; box-shadow:${T.cardShadow};
  text-decoration:none; cursor:pointer; font:inherit; color:inherit; text-align:left;
  width:100%;
}
@media (min-width:721px){ .gw{ min-height:220px; padding:26px 28px; } }

/* Obrázok je PRVOK KARTY, nie ikonka v rámčeku — presahuje hranu, aby karta pôsobila ako
   výrez do niečoho väčšieho. Výška v % karty, takže rastie s ňou. */
.gw-art{
  position:absolute; top:50%; transform:translateY(-50%); z-index:0;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none; transition:transform .35s ease;
}
.gw-art img{ display:block; }
.gw:hover .gw-art{ transform:translateY(-50%) scale(1.05); }
@media (prefers-reduced-motion: reduce){ .gw:hover .gw-art{ transform:translateY(-50%); } }

/* ⚠️ Miera je zo ŠÍRKY karty, nie z výšky: pri výške sa obrázok pri úzkom okne rozšíril
   pod text (karta ostáva vysoká, ale úzka) a nadpis začínal na knihe. Zo šírky sa obrázok
   a textový stĺpec nikdy neprekryjú.

   Kniha je ZÁMERNE väčšia než karta a padá cez jej DOLNÚ hranu (Matej 9.8.: „knihu zväčši ju
   ešte viac — zachovaj aby bol viditeľný nápis DOGMA ale kľudne ju posuň tak že logo bude
   takmer na spodnom okraji alebo aj cez okraj").
   ⚠️ Posun je translateY v % VLASTNEJ výšky obrázka, nie top/bottom v % karty. Percento v
   transforme sa počíta z vlastného boxu, takže -11 % vždy postaví hornú hranu obálky tesne
   nad nápis DOGMA (ten začína na ~14,5 % výšky obálky) — nezávisle od toho, aká vysoká je
   karta. Pri offsete viazanom na VÝŠKU karty (bottom:-30%) sa nápis pri inej šírke stratil,
   lebo veľkosť knihy ide zo ŠÍRKY. */
.gw-dogma .gw-art{ left:-14%; width:60%; top:0; bottom:auto; transform:translateY(-11%); }
.gw-dogma .gw-art img{ width:100%; height:auto; filter:drop-shadow(0 18px 38px rgba(10,10,10,0.45)); }
.gw-dogma:hover .gw-art{ transform:translateY(-11%) scale(1.03); }
@media (prefers-reduced-motion: reduce){ .gw-dogma:hover .gw-art{ transform:translateY(-11%); } }

/* Doska z ústavy ako slabá textúra pozadia (Matej: „do pozadia môžu byť slabo viditeľné tie
   obrázky čo sú v dogme"). Zdroj = explainers/01-2-god-is-dog z embedu ústavy, zmenšený.
   Sedí POD knihou aj textom, preto nízka krytie + papyrusový závoj nad ňou. */
.gw-plate{
  position:absolute; inset:0; z-index:0; pointer-events:none;
  background-image:url('/images/dogma-plate.webp');
  background-size:cover; background-position:64% 42%;
  opacity:0.30; mix-blend-mode:multiply;
}

/* ── AINUBIS = VLASTNÝ BRAND, nie papyrus (Matej 9.8.: „musí byť v jeho brande, modro
   zlatá, AI vibe… farebne odlíšiteľné"). Tmavá modrá karta so zlatým rámom a cyan svetlom;
   papyrusový dvojník vedľa (DOGMA) tak ostáva rozoznateľný na prvý pohľad.
   Cyan #5BE0F0 = cyborg paleta AINUBISA, vedomá odchýlka od brand v3.2
   (reference_dogypt_ainubis_cyborg_palette). */
.gw-ainubis{
  background:radial-gradient(circle at 82% 28%, #14304f 0%, #0a1a2e 46%, #050b16 100%);
  border:1.5px solid rgba(201,154,63,0.55);
  box-shadow:0 26px 60px -30px rgba(0,0,0,0.95), inset 0 1px 0 rgba(91,224,240,0.16);
}
/* Hlava je VEĽKÁ a orezaná hranou karty — vidno z nej asi polovicu (Matej: „väčšia ikonka,
   viditeľná len polovica hlavy AI(NUBIS)").
   ⚠️ Badge NIE JE priehľadné PNG — je to ČIERNA PLATŇA 136×160 (viď
   scripts/make-ainubis-circle.py). Na tmavej karte ju neprezradí farba, ale HRANA: preto
   maska, ktorá ľavý okraj platne rozpustí do pozadia. Bez nej tam stojí čierny zvislý zlom. */
.gw-ainubis .gw-art{
  right:-40%; width:82%; top:50%; transform:translateY(-50%);
  -webkit-mask-image:linear-gradient(to left, #000 52%, rgba(0,0,0,0) 96%);
  mask-image:linear-gradient(to left, #000 52%, rgba(0,0,0,0) 96%);
  filter:drop-shadow(0 0 34px rgba(91,224,240,0.28));
}
.gw-ainubis .gw-art img{ width:100%; height:auto; }
/* Text na tmavom — zlatý nadpis, cyan popisok, teplé svetlé telo. */
.gw-ainubis .gw-title{ color:#F5C73D; text-shadow:0 3px 18px rgba(0,0,0,0.7); }
.gw-ainubis .gw-sub{ color:#5BE0F0; }
.gw-ainubis .gw-text{ color:rgba(245,240,228,0.82); }

/* Závoj drží text čitateľný tam, kde obrázok podlieza — smeruje VŽDY od textovej strany. */
.gw::before{ content:''; position:absolute; inset:0; z-index:1; pointer-events:none; }
.gw-dogma::before{ background:linear-gradient(to left, rgba(250,244,236,0.86) 26%, rgba(250,244,236,0.52) 54%, rgba(250,244,236,0) 82%); }
.gw-ainubis::before{ background:linear-gradient(to right, rgba(5,11,22,0.92) 26%, rgba(5,11,22,0.55) 52%, rgba(5,11,22,0) 80%); }

.gw-body{ position:relative; z-index:2; width:52%; }
.gw-dogma .gw-body{ margin-left:auto; }    /* text vpravo */
.gw-ainubis .gw-body{ margin-right:auto; } /* text vľavo */

.gw-title{
  display:block; font-family:${FONT_TITLE}; font-weight:700; font-size:17px; line-height:1.1;
  letter-spacing:.12em; text-transform:uppercase; color:${T.inkStrong};
}
@media (min-width:721px){ .gw-title{ font-size:21px; letter-spacing:.14em; } }
.gw-sub{
  display:block; margin-top:5px; font-family:${FONT_UI}; font-weight:500; font-size:9.5px;
  letter-spacing:.22em; text-transform:uppercase; color:${T.cardEdge};
}
@media (min-width:721px){ .gw-sub{ font-size:10.5px; } }
.gw-text{
  display:block; margin-top:10px; font-family:${FONT_UI}; font-weight:400; font-size:11.5px;
  line-height:1.5; color:${T.inkWarm};
}
@media (min-width:721px){ .gw-text{ font-size:13px; margin-top:12px; } }

/* ── MOBIL ────────────────────────────────────────────────────────────────────
   Bloky ostávajú vedľa seba (Matej), takže na text ostane ~150 px. Obrázok preto
   prestane byť stĺpec a stane sa pozadím: väčší než karta, ukotvený do VONKAJŠIEHO
   dolného rohu, text sedí hore. */
@media (max-width:720px){
  .gw{ align-items:flex-start; padding:15px 14px; min-height:210px; }
  .gw-body{ width:100%; }
  .gw-art{ top:auto; bottom:-14%; transform:none; }
  .gw:hover .gw-art{ transform:none; }
  .gw-dogma .gw-art{ left:-30%; width:104%; bottom:-18%; }
  .gw-ainubis .gw-art{ right:-40%; top:auto; bottom:-10%; transform:none; width:104%; }
  /* Závoj ide zhora — text je hore, obrázok dole. Každá karta vo svojej farbe. */
  .gw-dogma::before{
    background:linear-gradient(to bottom, ${T.cardSoft} 26%, rgba(250,244,236,0.62) 54%, rgba(250,244,236,0) 80%);
  }
  .gw-ainubis::before{
    background:linear-gradient(to bottom, rgba(5,11,22,0.94) 24%, rgba(5,11,22,0.62) 52%, rgba(5,11,22,0) 82%);
  }
  .gw-title{ font-size:15px; letter-spacing:.1em; }
  .gw-text{ font-size:10.5px; line-height:1.45; margin-top:8px; }
}
`;

export function Gateways() {
  const t = useT();

  return (
    <section aria-label={t('pack.tiles.ariaLabel')}>
      <style>{CSS}</style>
      <div className="gw-row">
        {/* ── DOGMA — obrázok VĽAVO, text vpravo ────────────────────────────── */}
        <a
          className="gw gw-dogma pack-card-hover"
          href="https://dogma.dogypt.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={markConstitutionOpened}
        >
          {/* Slabá doska z ústavy v pozadí + tá istá obálka ako veľká ConstitutionCard —
              knihu si člen spojí s DOGMOU. */}
          <span className="gw-plate" aria-hidden />
          <span className="gw-art"><img src="/images/dogma-cover.png" alt="" aria-hidden /></span>
          <span className="gw-body">
            {/* ⚠️ Nadpis NESMIE byť „DOGMA" (Matej 9.8.: „v nadpise už neopakuj slovo dogma") —
                to slovo svieti na obálke knihy vedľa. Nadpis preto hovorí, ČO to je. */}
            <span className="gw-title">{t('pack.gateway.dogma.title')}</span>
            <span className="gw-sub">{t('pack.gateway.dogma.eyebrow')}</span>
            <span className="gw-text">{t('pack.gateway.dogma.text')}</span>
          </span>
        </a>

        {/* ── AINUBIS — text vľavo, obrázok VPRAVO (zrkadlo) ─────────────────── */}
        <button className="gw gw-ainubis pack-card-hover" type="button" onClick={openAinubis}>
          {/* AINUBIS má vlastnú cyborg identitu — badge nesie tvár, rám ostáva papyrusový,
              aby riadok držal pohromade (reference_dogypt_ainubis_cyborg_palette). */}
          <span className="gw-art"><img src={ainubisBadge} alt="" aria-hidden /></span>
          <span className="gw-body">
            <span className="gw-title">{t('pack.tiles.ainubis.title')}</span>
            <span className="gw-sub">{t('pack.tiles.ainubis.sub')}</span>
            <span className="gw-text">{t('pack.gateway.ainubis.text')}</span>
          </span>
        </button>
      </div>
    </section>
  );
}
