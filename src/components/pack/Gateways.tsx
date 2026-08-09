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

/* Kniha je na výšku, medailón je kruh — spoločné % by dalo dve rôzne optické váhy,
   preto má každý svoju mieru aj ukotvenie.
   ⚠️ Miera je zo ŠÍRKY karty, nie z výšky: pri výške sa obrázok pri úzkom okne rozšíril
   pod text (karta ostáva vysoká, ale úzka) a nadpis začínal na knihe. Zo šírky sa obrázok
   a textový stĺpec nikdy neprekryjú — art 42 % + odsadenie -13 % končí tam, kde text (44 %)
   začína. */
.gw-dogma .gw-art{ left:-13%; width:42%; }
.gw-dogma .gw-art img{ width:100%; height:auto; filter:drop-shadow(0 16px 34px rgba(10,10,10,0.40)); }

/* ⚠️ AINUBIS badge NIE JE štvorec s priehľadným okolím — je to ČIERNA PLATŇA 136×160
   (viď scripts/make-ainubis-circle.py). Voľne položený na papyrus vyzerá ako čierny
   obdĺžnik. Riešenie je to isté ako pri kruhovom odznaku do e-mailu: ČIERNY kruh, v ktorom
   hranica platne zmizne. Vedľajší efekt je vítaný — tmavý medailón presahujúci hranu karty
   je ten istý objekt ako orezaná planéta v bloku vyššie.
   Prstenec je CYAN, nie zlatý: AINUBIS má vlastnú cyborg paletu #5BE0F0 (vedomá odchýlka
   od brand v3.2, reference_dogypt_ainubis_cyborg_palette). */
.gw-ainubis .gw-art{
  right:-13%; width:40%; aspect-ratio:1 / 1; border-radius:50%; overflow:hidden;
  background:#000; border:1px solid rgba(91,224,240,0.42);
  box-shadow:0 0 0 7px rgba(91,224,240,0.07), 0 20px 44px -20px rgba(0,0,0,0.75);
}
.gw-ainubis .gw-art img{ width:76%; height:auto; }

/* Závoj drží text čitateľný tam, kde obrázok podlieza — smeruje VŽDY od textovej strany. */
.gw::before{ content:''; position:absolute; inset:0; z-index:1; pointer-events:none; }
.gw-dogma::before{ background:linear-gradient(to left, ${T.cardSoft} 34%, rgba(250,244,236,0) 72%); }
.gw-ainubis::before{ background:linear-gradient(to right, ${T.cardSoft} 34%, rgba(250,244,236,0) 72%); }

.gw-body{ position:relative; z-index:2; width:56%; }
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
  .gw-dogma .gw-art{ left:-34%; width:86%; }
  .gw-ainubis .gw-art{ right:-32%; bottom:-16%; width:78%; }
  /* Závoj ide zhora — text je hore, obrázok dole. */
  .gw-dogma::before,
  .gw-ainubis::before{
    background:linear-gradient(to bottom, ${T.cardSoft} 26%, rgba(250,244,236,0.55) 52%, rgba(250,244,236,0) 78%);
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
          {/* Tá istá obálka ako veľká ConstitutionCard — knihu si člen spojí s DOGMOU. */}
          <span className="gw-art"><img src="/images/dogma-cover.png" alt="" aria-hidden /></span>
          <span className="gw-body">
            <span className="gw-title">{t('pack.tiles.dogma.title')}</span>
            <span className="gw-sub">{t('pack.tiles.dogma.sub')}</span>
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
