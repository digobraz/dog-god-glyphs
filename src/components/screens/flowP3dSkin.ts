import { B3_CSS } from '@/lib/papyrus3d';
import { FIRA_UI_FACES } from '@/lib/firaUi';
import { APP_NEW } from '@/lib/packFlags';

// ════════════════════════════════════════════════════════════════════════════
// HEROFLOW V ŠATE PAPYRUS 3D (11. 11. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 11. 11.: *„heroflow je celý v poriadku, len ho potrebujeme dať viac do našich
// nových farieb a rebrandu"* → ŽIADNA zmena rozloženia, poradia ani textu, len vizuálny jazyk
// appky: tmavý obrys 2,5 px, spodná „pera", lapisové CTA, LT Museum len na nadpis/meno/CTA,
// Fira Sans (pod menom Space Grotesk) na zvyšok, čísla rovné.
//
// 🔑 SCOPING. Appka už nesie `html.papyrus3d` globálne (`lib/papyrus3d.ts`), web NIE a nesmie.
//    Preto všetko visí na `html[data-flow-p3d]`, ktorý `FlowRedress` vešia na <html> LEN na
//    obrazovkách vstupu (`flowP3dOn`) a pri odchode ho zloží. Tieto pravidlá teda nemajú ako
//    zasiahnuť onepage, /app ani stenu. Pod `APP_NEW` sa nič nevkladá dvakrát (tokeny a Fira už
//    sú globálne), na webe sa vloží len to, čo appka dostáva zo `zapniPapyrus3d()`:
//    tokeny `--p3d-*`, tlačidlá `.pk-b3`, Fira faces.
//
// ⚠️ Vrstva stojí NAD `flowFullSkin.ts` (rovnaké `html[data-flow-full]`, o jeden atribút
//    špecifickejšia) — tá sa nemení. Pokladňa, STAY a WELCOME (`FlowCheckout/Stay/WelcomeScreen`)
//    a STAY sú z vrstvy VYŇATÉ (`P3D_VYNIMKY`); Vitaj a Vstupné (`FlowWelcomeScreen`, `FlowVstupneScreen`) vrstvu od 11. 11. majú.
// ⚠️ CTA a pick/chip používajú tie isté premenné ako `.pk-b3--lapis` / `.pk-b3--paper`
//    (`--b3-*`), tvar je 1:1 z `B3_CSS`; triedy sa do 7 obrazoviek nepridávajú, `.hf-dock` ich nesie sám.
// ════════════════════════════════════════════════════════════════════════════

/** Cesty, kde vrstva NEBEŽÍ (pokladňa a to, čo za ňou nasleduje — rieši ich iný agent). */
const P3D_VYNIMKY = ['/checkout', '/payment', '/welcome', '/heroglyph/stay'];

export const flowP3dOn = (pathname: string) => !P3D_VYNIMKY.some((p) => pathname.startsWith(p));

const P = 'html[data-flow-p3d]';
const WALL = `${P} :is(.dark-bg, .hf-pale)`;
/** Obrazovky + okná nad nimi (`FlowModal`, textové okno, zodiak) — okná sú v portáli mimo `.hf-pale`. */
const ROOT = `${P} :is(.dark-bg, .hf-pale, .fm-root, .name-modal-root, .zs-root)`;
const TXT = ':is(div, span, p, h1, h2, h3, h4, button, input, textarea, select, label, b, strong, i, a, li, small, em)';
const UI = "'Space Grotesk', sans-serif";
const MUSEUM = "'LT Museum', serif";
const LAPIS_TINT = 'color-mix(in srgb, #16307A 18%, #fff)';

/** Len web: tokeny + `.pk-b3` + Fira. Appka to má globálne zo `zapniPapyrus3d()`. */
const WEB_ONLY = APP_NEW ? '' : FIRA_UI_FACES + B3_CSS.replace(/html\.papyrus3d/g, P);

export const FLOW_P3D_CSS = `${WEB_ONLY}
${P} body { font-variant-numeric: lining-nums tabular-nums; }

/* ── STENA: jednoliaty papyrus + kresba dole v PRIRODZENOM pomere (žiadne natiahnutie ani zoom) ── */
${WALL} { background: var(--p3d-paper); background-color: var(--p3d-paper); }
/* MOBIL: stena ostáva presne ako pred šatom (flowFullSkin: kresba 220 % šírky dole, jemný prechod zhora). */
/* PC (Matej 11. 11.: „na celú šírku aj výšku, 1:1"): obrázok na CELÚ šírku okna v prirodzenom pomere, ukotvený dole — vidno len spodnú časť. */
@media (min-width: 768px) {
  ${WALL} { overflow: hidden; }
  /* Škatuľa = celé okno, obrázok na 100 % šírky v prirodzenom pomere ukotvený dole (vidno spodok), prechod do priesvitnosti ZAČÍNA NA HORNEJ HRANE okna. */
  ${WALL}::before {
    top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: auto !important; height: auto !important;
    background-image: var(--bg-light) !important; background-size: 100% auto !important; background-repeat: no-repeat !important; background-position: center bottom !important;
    opacity: .12; filter: none !important;
    -webkit-mask-image: linear-gradient(180deg, transparent, #000 45%); mask-image: linear-gradient(180deg, transparent, #000 45%);
  }
}

/* ── PÍSMO: telo Fira (Space Grotesk), nadpis / meno / CTA LT Museum Black ──── */
${ROOT} ${TXT}:not(.em) { font-family: ${UI} !important; font-weight: 400; }
${ROOT} :is(b, strong) { font-weight: 700; }
${ROOT} :is(h1, h2, h3, .fdh-name, .hf-cta, .nm-cta, .btn-gold, button.bg-primary, .hf-pick .tx, [style*="brand-gradient"] p) {
  font-family: ${MUSEUM} !important; font-weight: 900; text-transform: none; letter-spacing: .01em; color: var(--p3d-ink);
}
${ROOT} .hf-speak:not(.st-speak) h2 { text-transform: none; letter-spacing: .01em; }
${ROOT} [style*="brand-gradient"] .text-white { text-transform: none; color: var(--p3d-ink) !important; }
${ROOT} .hf-speak:not(.st-speak) p { color: var(--p3d-ink); }
${ROOT} .hf-pick .tx { font-size: 14px; }
${ROOT} :is(.fdh-photo, .fdh-photo--empty) { font-family: ${MUSEUM} !important; font-weight: 900; color: var(--p3d-ink);
  border: 2px solid var(--p3d-ink); background: var(--p3d-paper-hi); box-shadow: 0 2px 0 var(--p3d-gold-solid); }

/* ── ZVÝRAZNENÉ SLOVO: zlato zostáva jediné, dostane tmavší krok pre kontrast na papyruse ── */
${ROOT} :is(.hf-speak:not(.st-speak), .hf-bubble) :is(b, strong),
${ROOT} :is([style*="brand-gradient"], .hf-speak) .text-amber-300 {
  background: linear-gradient(100deg, #6E4A12 0%, var(--p3d-gold-solid) 40%, var(--p3d-gold) 55%, var(--p3d-gold-solid) 70%, #6E4A12 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent !important;
}
${ROOT} [style*="brand-gradient"] .text-amber-300 { font-family: ${MUSEUM} !important; font-weight: 900; }

/* ── MEDAILÓN: fotka v tmavom obryse, prstenec = faraónske zlato 3D (jasné žlto-zlaté + spodná pera) ── */
${WALL} .fm > .fm-ring {
  display: block !important; position: absolute; inset: -6px; border-radius: 50%;
  background: linear-gradient(180deg, #FFE27A 0%, #F5C73D 45%, #E69E1A 100%) !important;
  border: 2.5px solid var(--p3d-ink); box-shadow: inset 0 2px 0 rgba(255, 255, 255, .6), 0 5px 0 var(--p3d-gold-ink), 0 9px 12px var(--p3d-sh);
}
${WALL} .fm-face { border: 2.5px solid var(--p3d-ink); box-shadow: none; }

/* ── BUBLINA: karta papyrus 3D (obrys, spodná pera), chvost v tej istej farbe ── */
${ROOT} .hf-speak:not(.st-speak) .say {
  background: var(--p3d-card); border: 2.5px solid var(--p3d-ink); border-radius: 16px;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, .55), var(--p3d-lift), 0 8px 10px var(--p3d-sh);
}
${ROOT} .hf-speak:not(.st-speak) .say::before { left: -11px; border-right-color: var(--p3d-ink); }
${ROOT} .hf-speak:not(.st-speak) .say::after { left: -7px; border-right-color: var(--p3d-paper-hi); }

/* ── ZÁLOŽKY TÉM (pomocné: name · born · status, who · name · stars, kategórie patrónov) ──
   Tiché: tenký zlatý obrys, malé písmená, bez pery. Aktívna = zlatá výplň (zlato = konštrukcia a poloha).
   Odpovede (.hf-pick) sú 3D papyrus tlačidlá s lapis tintom po výbere — zámerne iné než záložky. */
${ROOT} :is(.ftc-chip, .pt-chip, .pt-mix) {
  border: 2px solid color-mix(in srgb, var(--p3d-gold-solid) 75%, transparent); border-radius: 999px; min-height: 36px;
  background: transparent; color: var(--p3d-gold-ink); box-shadow: none;
  font-size: 13px; font-weight: 600; letter-spacing: .02em; text-transform: lowercase;
}
${ROOT} :is(.ftc-chip, .pt-chip, .pt-mix):hover { background: color-mix(in srgb, var(--p3d-gold) 14%, transparent); }
${ROOT} :is(.ftc-chip, .pt-chip, .pt-mix):active { transform: none; }
${ROOT} :is(.ftc-chip, .pt-chip, .pt-mix).on {
  background: linear-gradient(180deg, #FFE27A 0%, #F5C73D 55%, #E69E1A 100%); border-color: var(--p3d-ink); color: var(--p3d-ink);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, .55);
}
/* Brandová fajka (žlto-modrá, public/icons/sys/fajka.webp) namiesto kreslenej. */
${ROOT} .ftc-st { flex: 0 0 18px; width: 18px; height: 18px; }
${ROOT} .ftc-chip.done .ftc-st { background: url(/icons/sys/fajka.webp) center / contain no-repeat; }
${ROOT} .ftc-chip.done .ftc-st svg { display: none; }

/* ── VOĽBY (.hf-pick): karta s obrysom, ikonka v jamke, vybraná lapis tint ─── */
${ROOT} .hf-pick {
  border: 2.5px solid var(--p3d-ink); border-radius: 16px; background: var(--p3d-card);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, .55), 0 4px 0 var(--p3d-gold-solid);
}
${ROOT} .hf-pick:hover { border-color: var(--p3d-ink); }
${ROOT} .hf-pick .well { background: color-mix(in srgb, var(--p3d-gold) 26%, var(--p3d-paper)); border: 2px solid var(--p3d-ink); box-shadow: var(--p3d-inset); }
${ROOT} .hf-pick.on { border-color: #16307A; background: ${LAPIS_TINT}; box-shadow: inset 0 0 0 1px rgba(22, 48, 122, .45), 0 4px 0 #0A1A4A; }
${ROOT} .hf-pick.on .tx { color: #0A1A4A; text-shadow: none; }
${ROOT} .hf-pick:not(.on) .tx { color: var(--p3d-ink); text-shadow: none; }
${ROOT} .hf-pick.on .well { background: color-mix(in srgb, #16307A 16%, var(--p3d-paper-hi)); border-color: #16307A; }

/* ── POLIA: vsadená jamka (.pk-p3d-input) ────────────────────────────────── */
${ROOT} :is(.hf-field, .rv-ta, .name-preview-btn, .vs-input) {
  border: 2.5px solid var(--p3d-ink); border-radius: 16px; background: var(--p3d-paper-hi);
  box-shadow: var(--p3d-inset); color: var(--p3d-ink); font-weight: 400;
}
${ROOT} :is(.hf-field, .rv-ta, .name-preview-btn, .vs-input):focus { border-color: #16307A; box-shadow: var(--p3d-inset); }
${ROOT} .hf-field.is-valid { border-color: #16307A; background: ${LAPIS_TINT}; }

/* ── RIADKY PSOV, POČET, PRIDAŤ, ZAŠKRTÁVADLO ───────────────────────────── */
${ROOT} .hf-dogrow { border: 2.5px solid var(--p3d-ink); border-radius: 16px; background: var(--p3d-card);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, .55), 0 4px 0 var(--p3d-gold-solid); }
${ROOT} .hf-ord.set { border: 2px solid #EFD79A; box-shadow: 0 2px 0 #060F2C; }
${ROOT} .hf-addrow { border-color: var(--p3d-gold-solid); }
${ROOT} .hf-chk { border: 2.5px solid var(--p3d-ink); border-radius: 16px; background: var(--p3d-card); box-shadow: 0 4px 0 var(--p3d-gold-solid); }
${ROOT} .hf-chk .box { border: 2px solid var(--p3d-ink); }
${ROOT} .hf-chk .box svg { display: none; }
${ROOT} .hf-chk.on .box { background: url(/icons/sys/fajka.webp) center / contain no-repeat; border-color: transparent; box-shadow: none; }
${ROOT} .hf-chk.on { background: ${LAPIS_TINT}; border-color: #16307A; box-shadow: 0 4px 0 #0A1A4A; }
${ROOT} .hf-skip { font-weight: 600; font-size: 12px; color: var(--p3d-gold-ink); }

/* ── ŠÍPKA SPÄŤ = .pk-b3--paper ─────────────────────────────────────────── */
${ROOT} .hf-topbar button[class*="left-4"] {
  border: 2.5px solid var(--p3d-ink); background: linear-gradient(180deg, #fff, var(--p3d-paper)); color: var(--p3d-ink);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, .55), 0 3px 0 var(--p3d-gold-solid);
}

/* ── HLAVNÉ CTA = .pk-b3--lapis (lapis na bledom podklade) ───────────────── */
${ROOT} :is(.hf-cta, .nm-cta) {
  --b3-a: color-mix(in srgb, #16307A 72%, white); --b3-b: #0A1A4A; --b3-p: color-mix(in srgb, #0A1A4A 60%, black);
  border: 2.5px solid #EFD79A; border-radius: 16px; background: linear-gradient(180deg, var(--b3-a), var(--b3-b)); color: #EFD79A !important;
  font-size: 18px; line-height: 1; letter-spacing: .04em; text-transform: uppercase !important; text-shadow: none;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, .28), inset 0 -4px 0 rgba(0, 0, 0, .15), 0 6px 0 var(--b3-p), 0 11px 14px var(--p3d-sh);
  transition: transform .07s, box-shadow .07s, opacity .18s;
}
${ROOT} :is(.hf-cta, .nm-cta):hover:not(:disabled) { background: linear-gradient(180deg, var(--b3-a), var(--b3-b)); transform: none; }
${ROOT} :is(.hf-cta, .nm-cta):active:not(:disabled) {
  transform: translateY(5px);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, .28), inset 0 -2px 0 rgba(0, 0, 0, .15), 0 1px 0 var(--b3-p), 0 2px 4px var(--p3d-sh);
}
${ROOT} :is(.hf-cta, .nm-cta):is(:disabled, .is-off) {
  opacity: .55; cursor: default;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, .28), inset 0 -4px 0 rgba(0, 0, 0, .15), 0 6px 0 var(--b3-p), 0 11px 14px var(--p3d-sh);
}

/* ── REVEAL: nadpis, odpočet, rámy ─────────────────────────────────────── */
${ROOT} .rv-h1 { font-family: ${MUSEUM} !important; font-weight: 900; text-transform: none; color: var(--p3d-ink); }
${ROOT} .ch-traits .ch-trait .lb { font-family: ${UI} !important; font-weight: 700; color: var(--p3d-ink); }
${ROOT} .ch-traits .ch-trait.on .lb { color: #0A1A4A; }

/* ── VZDUCH A ROZLOŽENIE: obsah na STRED medzi progresom a CTA (margin:auto na dieťati, nie justify-center) ── */
${WALL} .hf-stage { padding-top: 40px; }
${WALL} .hf-stage:not(.wl-page) > * { margin-top: 0; margin-bottom: 0; }
${WALL} .hf-stage:not(.wl-page) > :first-child { margin-top: auto; }
${WALL} .hf-stage:not(.wl-page) > :last-child { margin-bottom: auto; }

/* ── E-MAIL: veľká fotka v strede, bublina pod ňou ─────────────────────────── */
${WALL} .hf-stage:has(:is(.hf-skip, .hf-dogfit)) .hf-speak:not(.st-speak) { flex-direction: column; align-items: center; gap: 16px; }
${WALL} .hf-stage:has(:is(.hf-skip, .hf-dogfit)) .hf-speak:not(.st-speak) > .fm { width: var(--p3d-ph, 112px) !important; height: var(--p3d-ph, 112px) !important; }
${WALL} .hf-stage:has(:is(.hf-skip, .hf-dogfit)) .hf-speak:not(.st-speak) .say { width: 100%; text-align: center; }
${WALL} .hf-stage:has(:is(.hf-skip, .hf-dogfit)) .hf-speak:not(.st-speak) .say::before { left: 50%; top: -11px; margin: 0 0 0 -8px; border: 8px solid transparent; border-top: 0; border-bottom: 9px solid var(--p3d-ink); }
${WALL} .hf-stage:has(:is(.hf-skip, .hf-dogfit)) .hf-speak:not(.st-speak) .say::after { left: 50%; top: -7px; margin: 0 0 0 -7px; border: 7px solid transparent; border-top: 0; border-bottom: 8px solid var(--p3d-paper-hi); }

/* ── INFO IKONKA (i): tmavá, viditeľná na papyruse ───────────────────────── */
${WALL} button.absolute.top-3.right-3 > span { border-color: var(--p3d-ink); background: var(--p3d-paper-hi); box-shadow: 0 2px 0 var(--p3d-gold-solid); }
${WALL} button.absolute.top-3.right-3 svg { color: var(--p3d-ink) !important; }
${WALL} .ow-info { border: 2px solid var(--p3d-ink); color: var(--p3d-ink); background: var(--p3d-paper-hi); box-shadow: 0 2px 0 var(--p3d-gold-solid); }
${WALL} .ow-info.on { border-color: #16307A; color: #16307A; }

/* ── POLE MENA: bez žiary, NEXT pod poľom na celý riadok ──────────────────── */
${WALL} :is(.name-preview-wrap, .hf-ring, .hf-field-wrap) { box-shadow: none !important; }
${WALL} :is(.name-preview-wrap, .hf-ring)::before, ${WALL} :is(.name-preview-wrap, .hf-ring)::after { display: none !important; }
${WALL} .name-preview-btn { border-color: var(--p3d-ink) !important; box-shadow: var(--p3d-inset) !important; outline: none; }
${WALL} .name-preview-wrap.is-filled .name-preview-btn { border-color: #16307A !important; }
${WALL} .nm-row { flex-direction: column; align-items: stretch; gap: 12px; }
${WALL} .nm-row .name-preview-wrap { flex: 0 0 auto !important; width: 100%; }

/* ── OKNÁ NAD OBRAZOVKOU (FlowModal, textové okno, zodiak, viac info): karta papyrus 3D, zarovnané na stred ── */
${P} :is(.fm-card, .name-modal-card, .zs-card) {
  background: var(--p3d-card); border: 2.5px solid var(--p3d-ink); border-radius: 16px;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, .55), 0 6px 0 var(--p3d-gold-ink), 0 14px 24px var(--p3d-sh);
}
${P} :is(.fm-card, .name-modal-card, .zs-card) :is(h1, h2, h3, p, .mi-eye, .mi-text, .fp-head, .zs-title, .name-modal-title) { text-align: center; }
${P} :is(.fm-card, .name-modal-card, .zs-card) :is(h1, h2, h3, .mi-text h3, .ow-egypt-h, .fp-head, .zs-title, .name-modal-title, .mi-money b) {
  font-family: ${MUSEUM} !important; font-weight: 900; text-transform: none; letter-spacing: .01em; color: var(--p3d-ink);
}
${P} .fm-card :is(.mi-close, .name-modal-done, .zs-switch) { align-self: stretch; }

/* ── PC: Hektorova fotka čo najväčšia, bublina menšia (Matej 11. 11.) ───────── */
@media (min-width: 900px) {
  ${WALL} { --p3d-ph: 152px; }
  ${WALL} .hf-stage:has(.hf-dogfit) { --p3d-ph: 104px; }
  ${WALL} .hf-speak:not(.st-speak) > .fm { width: 112px !important; height: 112px !important; }
  ${WALL} .hf-stage:has(:is(.hf-skip, .hf-dogfit)) .hf-speak:not(.st-speak) > .fm { width: var(--p3d-ph) !important; height: var(--p3d-ph) !important; }
  ${WALL} .hf-medin .fm { width: 176px !important; height: 176px !important; }
  ${WALL} .hf-speak:not(.st-speak) .say { padding: 6px 12px; }
  ${WALL} .hf-speak:not(.st-speak) h2 { font-size: 20px; }
  ${WALL} .hf-speak:not(.st-speak) p { font-size: 14px; }
  /* NATURE: dva rady po štyri */
  ${WALL} .ch-traits .ch-trait { width: calc((100% - 24px) / 4); padding: 8px 4px; }
  ${WALL} .ch-traits .ch-trait img { width: 36px; height: 36px; }
}
@media (min-width: 900px) and (max-height: 780px) { ${WALL} { --p3d-ph: 120px; } ${WALL} .hf-medin .fm { width: 150px !important; height: 150px !important; } }

/* NATURE na nízkom PC: ustúpi obsah, nie vzduch pod progresom */
@media (min-width: 900px) and (max-height: 780px) {
  ${WALL} .hf-stage:has(.ch-traits) .hf-speak:not(.st-speak) > .fm { width: 92px !important; height: 92px !important; }
  ${WALL} .ch-traits .ch-trait { padding: 4px; }
  ${WALL} .ch-traits .ch-trait img { width: 30px; height: 30px; }
}

/* ── DOPLŇ FOTO A NARODENINY: veta nad dolným CTA + jemne zvýraznené chýbajúce chipy ── */
${WALL} .hf-hint {
  position: fixed; z-index: 39; margin: 0; text-align: center; font-size: 13px; font-weight: 600; color: var(--p3d-gold-ink); text-decoration: none; text-transform: none; letter-spacing: 0;
  left: max(16px, calc(50% - 320px)); right: max(16px, calc(50% - 320px));
  bottom: calc(max(24px, env(safe-area-inset-bottom)) + 48px + 16px);
}
@keyframes p3d-nudge { 0%, 100% { box-shadow: 0 0 0 0 rgba(245, 199, 61, .75); } 60% { box-shadow: 0 0 0 7px rgba(245, 199, 61, 0); } }
${WALL} :is(.hf-pic.add, .hf-dpill.miss) { animation: p3d-nudge 1.8s ease-out infinite; }
@media (prefers-reduced-motion: reduce) { ${WALL} :is(.hf-pic.add, .hf-dpill.miss) { animation: none; } }

/* ── POPUP „KTO JE HEKTHOR": kompaktný, dlaždice papyrus 3D, na PC dve polovice ── */
${P} .nm-who.fm-card { gap: 8px; padding: 14px 16px; }
${P} .nm-who .nm-who-v { aspect-ratio: 1 / 1; max-height: 38dvh; object-position: center 50%; border: 2.5px solid var(--p3d-ink); border-radius: 14px; }
${P} .nm-who-h { font-size: 22px; }
${P} .nm-who-tx { font-size: 14px; line-height: 1.4; font-weight: 400; }
${P} .nm-who .nm-who-facts { display: flex; grid-template-columns: none; gap: 0; justify-content: space-between; padding: 4px 0; border-top: 2px solid var(--p3d-gold-solid); border-bottom: 2px solid var(--p3d-gold-solid); }
${P} .nm-who .nm-who-facts div { flex: 1 1 0; min-width: 0; grid-column: auto; padding: 2px 4px; border: 0; border-radius: 0; background: none; box-shadow: none; gap: 0; }
${P} .nm-who .nm-who-facts div + div { border-left: 2px solid color-mix(in srgb, var(--p3d-gold-solid) 55%, transparent); }
${P} .nm-who-facts dt { font-family: ${UI} !important; font-weight: 600; font-size: 10px; letter-spacing: .1em; color: var(--p3d-gold-ink); }
${P} .nm-who-facts dd { font-family: ${UI} !important; font-weight: 700; font-size: 14px; color: var(--p3d-ink); }
@media (min-width: 900px) {
  ${P} .nm-who.fm-card {
    max-width: 880px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr) auto;
    column-gap: 24px; row-gap: 10px; align-items: center; padding: 18px;
  }
  ${P} .nm-who .nm-who-v { grid-column: 1; grid-row: 1 / 4; align-self: center; width: 100%; height: min(68dvh, 500px); max-height: none; aspect-ratio: auto; object-position: center center; }
  ${P} .nm-who-h { grid-column: 2; grid-row: 1; }
  ${P} .nm-who .fp-scroll { grid-column: 2; grid-row: 2; align-self: center; }
  ${P} .nm-who .nm-cta { grid-column: 2; grid-row: 3; }
}

/* CTA veľkými všade (aj tlačidlá .pk-b3 na Vstupnom/Vitaj) */
${P} .pk-b3 { text-transform: uppercase; letter-spacing: .04em; }

${WALL} .hf-speak .fq-mark { top: -12px; right: -26px; }

/* ── PROGRES (FlowProgress v flowRedress.tsx): hrubá pilulka s obrysom, zlatá výplň ── */
${P} .fp-track { height: 16px !important; box-sizing: border-box; border: 2.5px solid var(--p3d-ink); background: var(--p3d-paper-hi) !important; box-shadow: var(--p3d-inset), 0 3px 0 var(--p3d-gold-solid); }
${P} .fp-fill { background: linear-gradient(180deg, #FFE27A 0%, #F5C73D 50%, #E69E1A 100%) !important; border-right: 2.5px solid var(--p3d-ink); box-sizing: border-box; box-shadow: inset 0 2px 0 rgba(255, 255, 255, .55); }
`;
