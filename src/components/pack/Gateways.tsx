// Gateways — TRETÍ riadok homepage `/pack` (Matej 2026-08-09: „3 riadok rozdel na dva
// bloky – DOGMA a ANUBIS").
//
// PC: dva bloky vedľa seba, ZRKADLOVO otočené — obrázky sedia na VONKAJŠÍCH okrajoch riadku,
// texty vnútri:
//     [ 📕 obrázok | DOGMA text ]   [ AINUBIS text | 🐕‍🦺 obrázok ]
// Matej: „lavy blok daj obrázok DOGMY nalavo a nadpis a text napravo a napravo zasa
// opačne aby boli obrázky a texty presne na opak (obrázky po bokoch)".
//
// MOBIL: **1 blok = 1 riadok** (Matej 2026-08-09: „musíme to na mobile upraviť nie napolovicu
// ale 1blok=1riadok"). Predtým tu bola vlastná mobilná kompozícia — obrázok ako výrez na
// pozadí karty, text hore cez závoj — lebo pri dvoch blokoch vedľa seba ostalo na text ~150 px.
// Na plnú šírku už nie je dôvod: karta má cez 350 px, takže platí TÁ ISTÁ kompozícia ako na
// PC (obrázok pri vonkajšej hrane, text vedľa neho). Menia sa len rozmery, nie pravidlá —
// jedna kompozícia namiesto dvoch je aj menej miest, kde sa dá rozísť.
//
// OBSAH = NADPIS + JEDEN RIADOK (Matej 2026-08-09: „iba nadpis + zmeníme podnadpis a vyhodíme
// body a zvačšíme text"). Trojposchodie nadpis → eyebrow → odstavec zmizlo; `gw-lead` je
// čitateľná veta, nie prestrkaný eyebrow.
//
// NAHRÁDZA `QuickTiles` (pás MAPA · DOGMA · AINUBIS). `QuickTiles.tsx` sa NEMAZAL, parkuje
// ako `PackTree`/`DailyPrayers`/`NextTripCard`.
// ⚠️ Dlaždica MAPA tým z homepage odišla — nie je to diera: na mapu vedie celá pravá karta
//    bloku 2 (`TripSpotlight`, nadpis „Rozšír hranice") a obe sú aj tak za `DEV_FULL`.
//    Keby `TripSpotlight` z homepage niekedy odišiel, MAPA sa sem musí vrátiť.
//
// Dizajn = papyrus lock (Entry.tsx): `T.cardGrad` · 1.5px `T.cardEdge` · radius 16 ·
// `T.cardShadow`. Nadpis Cinzel 700 uppercase, text Space Grotesk — dva fonty, nie jeden.
import { PACK_THEME, FONT_TITLE, FONT_UI } from './packTheme';
import { markConstitutionOpened } from '@/lib/constitutionRead';
import { openAinubis } from '@/lib/ainubisBus';
import { useT } from '@/i18n/LanguageContext';
import ainubisHead from '@/assets/ainubis-head.png';

const T = PACK_THEME;

// ⚠️ JS template literal — spätný apostrof v CSS komentári zhodí build a `tsc` to nechytí.
// ⚠️ JEDNA hranica mobil/desktop: 720 / 721 px. Dve rôzne (napr. 720 pre kompozíciu a 768
//    pre typografiu) vyrobia pásmo šírok, kde neplatí ani jedno pravidlo.
const CSS = `
/* 1 blok = 1 riadok na mobile, dva stĺpce až od 721 px. */
.gw-row{ display:grid; grid-template-columns:1fr; gap:12px; }
@media (min-width:721px){ .gw-row{ grid-template-columns:1fr 1fr; gap:20px; } }

.gw{
  position:relative; overflow:hidden; display:flex; align-items:center;
  min-height:172px; border-radius:16px; padding:18px 20px;
  background:${T.cardGrad}; border:1.5px solid ${T.cardEdge}; box-shadow:${T.cardShadow};
  text-decoration:none; cursor:pointer; font:inherit; color:inherit; text-align:left;
  width:100%;
}
@media (min-width:721px){ .gw{ min-height:220px; padding:26px 28px; } }

/* Obrázok je PRVOK KARTY, nie ikonka v rámčeku — presahuje hranu, aby karta pôsobila ako
   výrez do niečoho väčšieho. */
/* ⚠️ z-index 0 = POD závojom (::before). Pri DOGME je to zámer: závoj rozpúšťa pravú hranu
   obálky do papyrusu, inak by kniha končila tvrdým zvislým rezom. AINUBIS má opačné
   zadanie (hlava nad všetkým) a prepíše si to nižšie. */
.gw-art{
  position:absolute; top:50%; transform:translateY(-50%); z-index:0;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none; transition:transform .35s ease;
}
.gw-art img{ display:block; width:100%; height:auto; }
.gw:hover .gw-art{ transform:translateY(-50%) scale(1.05); }
@media (prefers-reduced-motion: reduce){ .gw:hover .gw-art{ transform:translateY(-50%); } }

/* ── DOGMA ─────────────────────────────────────────────────────────────────────
   ⚠️ Miera je zo ŠÍRKY karty, nie z výšky: pri výške sa obrázok pri úzkom okne rozšíril
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
.gw-dogma .gw-art{ left:-9%; width:42%; top:0; bottom:auto; transform:translateY(-11%); }
@media (min-width:721px){ .gw-dogma .gw-art{ left:-14%; width:60%; } }
/* ⚠️ Kniha a textový stĺpec sa NESMÚ prekryť a ich šírky sa počítajú z RÔZNYCH boxov:
   obrázok je absolútny (percentá z padding boxu, teda skoro celá karta), text je flex
   položka (percentá z CONTENT boxu, teda karta bez paddingu). Na PC preto 60 % knihy +
   56 % textu vychádzalo na −4 px prekryv a písmeno „s" v „spoznaj" zmizlo pod obálkou.
   Text má na PC vlastnú, užšiu šírku — nie je to preklep. */
.gw-dogma .gw-art img{ filter:drop-shadow(0 18px 38px rgba(10,10,10,0.45)); }
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
  /* Pozadie = to isté, čo panel widgetu (AinubisWidget.css .ainubis-panel), plus dúhový
     nádych — AINUBIS je stroj, nie chrámový povrch. */
  background:
    linear-gradient(118deg, rgba(91,224,240,0.10) 0%, rgba(126,90,240,0.08) 42%, rgba(245,199,61,0.05) 100%),
    radial-gradient(78% 105% at 76% 54%, rgba(70,168,255,0.52) 0%, rgba(59,158,255,0.12) 52%, rgba(59,158,255,0) 74%),
    linear-gradient(160deg, #08131f 0%, #04090f 62%, #061119 100%);
  border:1.5px solid rgba(91,224,240,0.34);
  box-shadow:0 26px 60px -30px rgba(0,0,0,0.95), inset 0 1px 0 rgba(91,224,240,0.20);
}
/* Holografická mriežka (Matej 9.8.: „pozadie ainubisa urob atraktívnejšie, holografická
   mriežka"). Dva 1px rastre + maska, ktorá ich rozpustí do rohov — mriežka cez celú plochu
   pôsobí ako tabuľka, nie ako projekcia. ::before je obsadené závojom, preto ::after.
   ⚠️ Mriežka je POZADIE: z-index 1, teda pod hlavou (z-index 2). Aby neliezla do kresby,
   musí byť hlava NEPRIEHĽADNÁ — viď poznámku pri .gw-ainubis .gw-art. */
.gw-ainubis::after{
  content:''; position:absolute; inset:0; z-index:1; pointer-events:none;
  background-image:
    linear-gradient(rgba(91,224,240,0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(91,224,240,0.16) 1px, transparent 1px);
  background-size:28px 28px, 28px 28px;
  -webkit-mask-image:radial-gradient(115% 95% at 72% 26%, #000 0%, rgba(0,0,0,0.45) 52%, rgba(0,0,0,0) 84%);
  mask-image:radial-gradient(115% 95% at 72% 26%, #000 0%, rgba(0,0,0,0.45) 52%, rgba(0,0,0,0) 84%);
}
/* Hlava je VEĽKÁ a orezaná hranou karty — vidno z nej asi polovicu (Matej: „väčšia ikonka,
   viditeľná len polovica hlavy AI(NUBIS)").
   ⚠️ Zdroj je ainubis-head.png (800 px, PRIEHĽADNÉ okolie) — NIE starý ainubis-badge.png.
   Ten mal 160 px a bol to ČIERNY OBDĹŽNIK, nie výrez: na karte sa škáloval ~3× (rozmazaný)
   a jeho hranu bolo treba skrývať maskou, cez ktorú potom presvitala mriežka
   (Matej 9.8.: „ikonka je rozmazaná… okraje presvitajú… mriežka zasahuje do obrázka").
   Preto tu už NIE JE maska ani mix-blend-mode — kresba je plne krycia a stojí nad mriežkou. */
.gw-ainubis .gw-art{
  z-index:2;   /* nad mriežkou (1) aj závojom — hlava je pevný objekt, nie hologram */
  right:-24%; width:56%; top:50%; transform:translateY(-50%);
  /* Hlava je tmavá modrá na takmer čiernom pozadí — svetlo za ňou (radiála v pozadí karty)
     ju drží ako kresbu, nie siluetu. Žiara je len dokreslenie, jas sa NEZVYŠUJE. */
  filter:drop-shadow(0 0 40px rgba(91,224,240,0.55));
}
@media (min-width:721px){ .gw-ainubis .gw-art{ right:-28%; width:66%; } }

/* ── Značka „plná verzia čoskoro" (Matej 9.8.: „daj preč ten ribbon COMING SOON a dajme
   to že full version alebo dashboard coming soon") ────────────────────────────
   Šikmá stužka cez roh tvrdila, že karta NEFUNGUJE — pritom klik otvára chat presne ako
   doteraz. Nahradil ju drobný čip NAD menom: hovorí, že chýba len plná verzia, a nesie
   sa s textom, takže nekradne roh ani nediktuje odsadenie tela karty.
   ⚠️ Preto zmizol aj padding-top na .gw-ainubis .gw-body — bol tam len kvôli stužke. */
.gw-flag{
  display:inline-block; margin-bottom:8px; padding:3px 9px; border-radius:999px;
  font-family:${FONT_UI}; font-weight:600; font-size:8.5px;
  letter-spacing:.14em; text-transform:uppercase; color:#04121a;
  background:linear-gradient(90deg, #3FB6CC 0%, #5BE0F0 50%, #3FB6CC 100%);
  box-shadow:0 4px 14px rgba(0,0,0,0.45);
}
@media (min-width:721px){ .gw-flag{ font-size:9.5px; padding:4px 11px; margin-bottom:10px; } }

/* Typografia NIE JE zlatá (Matej 9.8.: „nadpis musí byt brandovY AI inej farby… pozri si ako
   sme to spravili inde"). Zdroj pravdy = hlavička widgetu v AinubisWidget.css: meno = Cinzel 700
   v ľadovo bielej #E6FAFF s cyan žiarou, „AI" v cyan. Zlatá v cyborg palete patrí ČLOVEKU. */
.gw-ainubis .gw-title{
  color:#E6FAFF; letter-spacing:.16em; text-indent:.16em;
  text-shadow:0 0 18px rgba(91,224,240,0.55);
}
/* „AI" v mene je modré — kúsok stroja v mene strážcu. Tá istá dvojica hodnôt ako
   .ainubis-ai v AinubisWidget.css; keď sa mení tam, musí sa aj tu. */
.gw-ai{ color:#5BE0F0; text-shadow:0 0 16px rgba(91,224,240,0.75); }
.gw-ainubis .gw-lead{ color:rgba(230,250,255,0.82); text-shadow:0 2px 10px rgba(3,7,12,0.85); }

/* Závoj drží text čitateľný tam, kde obrázok podlieza — smeruje VŽDY od textovej strany. */
.gw::before{ content:''; position:absolute; inset:0; z-index:1; pointer-events:none; }
.gw-dogma::before{ background:linear-gradient(to left, rgba(250,244,236,0.86) 26%, rgba(250,244,236,0.52) 54%, rgba(250,244,236,0) 82%); }
.gw-ainubis::before{ background:linear-gradient(to right, rgba(5,11,22,0.92) 26%, rgba(5,11,22,0.55) 52%, rgba(5,11,22,0) 80%); }

/* ⚠️ Text má z-index 3 = NAD obrázkom (2). Hlava AINUBISA je od tejto verzie nepriehľadná,
   takže keby si sadla na text, zožrala by ho celý — nie je to teoretická poistka. */
.gw-body{ position:relative; z-index:3; width:62%; }
@media (min-width:721px){ .gw-body{ width:56%; } }
@media (min-width:721px){ .gw-dogma .gw-body{ width:50%; } }
.gw-dogma .gw-body{ margin-left:auto; }    /* text vpravo */
.gw-ainubis .gw-body{ margin-right:auto; } /* text vľavo */

.gw-title{
  display:block; font-family:${FONT_TITLE}; font-weight:700; font-size:22px; line-height:1.08;
  letter-spacing:.1em; text-transform:uppercase; color:${T.inkStrong};
}
/* ⚠️ Na PC je stupeň PLYNULÝ (clamp s vw), nie pevný. Karta má na 1440 px šírku ~478 px,
   ale hneď za hranicou 721 px len ~326 px — pri pevných 23/38 px sa nadpis DOGMY zlomil na
   tri riadky a podtitulok vypadol pod dolnú hranu karty, a jednoslovné AINUBIS (nemá kde
   zalomiť) prebehlo pod hlavu psa. Horná medza clampu = stav pri 1440 px, dolná = stav,
   ktorý sa ešte zmestí do najužšej dvojstĺpcovej karty. */
@media (min-width:721px){ .gw-title{ font-size:clamp(19px, 2.5vw, 27px); letter-spacing:.12em; } }
/* Meno AINUBIS je DOMINANTA karty (Matej 9.8.: „tento nadpis zvačši musí byť dominanta") —
   je to jedno slovo, unesie výrazne väčší stupeň než dvojriadkový nadpis DOGMY.
   Horná medza clampu je držaná ŠÍRKOU tela karty: „AINUBIS" je 7 znakov a pri 56 % šírky
   karty (~268 px na 1440 px) sa 44 px ešte zmestí na jeden riadok — viac už láme slovo. */
.gw-ainubis .gw-title{ font-size:32px; }
@media (min-width:721px){ .gw-ainubis .gw-title{ font-size:clamp(28px, 3.9vw, 44px); } }

.gw-lead{
  display:block; margin-top:9px; font-family:${FONT_UI}; font-weight:400; font-size:12.5px;
  line-height:1.45; color:${T.inkWarm};
}
@media (min-width:721px){ .gw-lead{ font-size:clamp(12px, 1.35vw, 14px); margin-top:12px; } }
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
            <span className="gw-lead">{t('pack.gateway.dogma.lead')}</span>
          </span>
        </a>

        {/* ── AINUBIS — text vľavo, obrázok VPRAVO (zrkadlo) ─────────────────── */}
        <button className="gw gw-ainubis pack-card-hover" type="button" onClick={openAinubis}>
          <span className="gw-art"><img src={ainubisHead} alt="" aria-hidden /></span>
          <span className="gw-body">
            {/* Čip hovorí, že chýba PLNÁ verzia — klik otvára chat úplne normálne, presne
                ako doteraz. Preto tu už nie je stužka „COMING SOON" cez roh. */}
            <span className="gw-flag">{t('pack.gateway.comingSoon')}</span>
            {/* Meno sa NEPREKLADÁ a delí sa na dve farby priamo v markupe — „AI" je stroj,
                „NUBIS" strážca. Rovnaký span ako v hlavičke widgetu (`.ainubis-ai`). */}
            <span className="gw-title"><span className="gw-ai">AI</span>NUBIS</span>
            <span className="gw-lead">{t('pack.gateway.ainubis.lead')}</span>
          </span>
        </button>
      </div>
    </section>
  );
}
