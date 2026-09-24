// ════════════════════════════════════════════════════════════════════════════
// ODKIAĽ TO VIEM — `/pack/ainubis/sources` (24. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Voľba **E2** Mateja nad `plany/nakres-nastenka-zdroje-2026-09-24.html`:
// zoznam zdrojov mozgu má VLASTNÚ ADRESU a tri vchody — riadok „from" pod
// odpoveďou (chat aj nástenka), riadok pod mojimi príspevkami a päta VAULTu.
// Kniha je objekt a má jednu kartu, presne ako výlet alebo pes (lock §4.1).
//
// 🔴 KÔŠ 2 — „POZERÁM SA" (lock `architektura-pack.md` §3): zanorené čítanie.
//    Dole je LIŠTA, hore ŠÍPKA SPÄŤ. Nie kôš 3 — nič sa tu nerobí, len číta,
//    a človek sa z nej musí vedieť pohnúť kamkoľvek.
//    ⚠️ Šípka vedie `navigate(-1)`, nie natvrdo na `/pack/ainubis`: vchody sú
//       tri a dva z nich (nástenka, chat) sú roviny, ktoré sa z adresy nedajú
//       obnoviť — natvrdo by človeka z nástenky vyhodilo do VAULTU.
//
// ⚠️ ŠAT JE AINUBISOV, NIE PAPYRUS — do `PAPER_ROUTES` routa NEPATRÍ.
// 🔴 ČÍSLA SÚ DNES ODPÍSANÉ (`vault/vaultSources.ts`). Kým je to maketa, je to
//    v poriadku; naostro sa MUSIA pýtať korpusu. Poznámka je pri dátach.
// ════════════════════════════════════════════════════════════════════════════
import { useNavigate } from 'react-router-dom';
import { PackBottomNav, MessagingOverlayHost } from '@/components/pack/PackLayout';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import {
  PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI,
} from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { HandArrowLeft } from '@/components/pack/HandIcons';
import { VAULT_SOURCES, VAULT_SOURCE_TOTALS, WEB_RESEARCH_EXISTS } from '@/components/pack/vault/vaultSources';

/** Tá istá meraná šírka ako nástenka a vlákno chatu — je to text, nie obrazovka. */
const COL_W = 760;

const CSS = `
.aks-root{position:fixed;inset:0;overflow-y:auto;overscroll-behavior:contain;
  background:${AINUBIS.surfaceBase};color:${AINUBIS.ink};font-family:${FONT_UI};}
.aks-in{max-width:${COL_W}px;margin:0 auto;display:flex;flex-direction:column;gap:${PACK_SPACE.lg}px;
  padding:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.lg}px) ${PACK_SPACE.lg}px
    calc(var(--pack-nav-h,68px) + ${PACK_SPACE.xxl}px);}
.aks-head{display:flex;align-items:center;gap:${PACK_SPACE.md}px;}
.aks-back{width:32px;height:32px;flex:0 0 32px;display:flex;align-items:center;justify-content:center;
  border-radius:${PACK_R.pill}px;cursor:pointer;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.cyan};}
.aks-back:hover{border-color:${AINUBIS.edgeStrong};}
.aks-title{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.1;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.ink};}
/* 🔴 PRVÁ VETA MUSÍ POVEDAŤ, ČOHO SÚ TO ZDROJE. „Zvitok" znamená v appke dve
   veci — 675 chunkov mozgu, ktorý odpovedá, a cieľových 569 zvitkov VAULTU.
   Bez tejto vety si dve čísla na dvoch obrazovkách protirečia. */
.aks-lead{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.55;color:${AINUBIS.inkDim};}
.aks-nums{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.xl}px;}
.aks-num b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1;
  color:${AINUBIS.cyan};}
.aks-num em{font-style:normal;font-size:${PACK_TEXT.micro}px;line-height:1.6;
  letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}

/* ── KARTA ZDROJA — F1, SKROMNÁ (Matej 24. 9.) ─────────────────────────────
   Meno · autor, rok, rozsah, druh · počet zvitkov · dva štítky. Nič viac:
   háčik ani rozpad stavov (konsenzus / tradícia / autorský postoj) na karte
   nie sú, hoci sú v korpuse premerané. */
.aks-src{border-radius:${PACK_R.frame}px;border:1px solid ${AINUBIS.edge};
  background:rgba(3,7,12,0.35);padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;}
.aks-src h2{margin:0;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.body}px;line-height:1.35;
  color:${AINUBIS.ink};}
.aks-au{margin:${PACK_SPACE.xs}px 0 0;font-size:${PACK_TEXT.label}px;line-height:1.45;color:${AINUBIS.inkFaint};}
/* ⚠️ PRUH PODIELU TU NIE JE. Prvá verzia ho mala (dve knihy nesú dve tretiny
   korpusu a bolo to na ňom vidno), ale zhodil stráž check:pack: progres má
   od 14. 9. 2026 jediný recept .pk-progress a ten je namiešaný na papyrus.
   Zhoduje sa to aj s voľbou F1 — karta je skromná. Keď sa podiel bude chcieť
   ukázať, pýtaj si AINUBISOV progres do katalógu PACK_BLOCKS, nie vlastný pruh. */
.aks-mt{margin-top:${PACK_SPACE.md}px;display:flex;flex-wrap:wrap;gap:${PACK_SPACE.md}px;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
.aks-mt b{color:${AINUBIS.cyan};font-weight:500;}

/* PRÁZDNY RIADOK — zdroj, ktorý NEEXISTUJE. Nie nula medzi číslami. */
.aks-none{border-radius:${PACK_R.frame}px;border:1px dashed ${AINUBIS.edge};background:transparent;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;color:${AINUBIS.inkFaint};}
.aks-none h2{margin:0;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.body}px;line-height:1.35;
  color:${AINUBIS.inkFaint};}
.aks-none p{margin:${PACK_SPACE.xs}px 0 0;font-size:${PACK_TEXT.label}px;line-height:1.45;}

.aks-note{border-radius:${PACK_R.tile}px;border:1px dashed ${AINUBIS.edge};background:${AINUBIS.raised};
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;font-size:${PACK_TEXT.label}px;line-height:1.5;
  color:${AINUBIS.inkFaint};}
.aks-note b{color:${AINUBIS.cyan};font-weight:600;}

@media (min-width:1024px){
  .aks-in{padding:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.xl}px) ${PACK_SPACE.xxl}px
    calc(var(--pack-nav-h,68px) + ${PACK_SPACE.xxl}px);}
}
`;

export default function PackAinubisSources() {
  const id = usePackIdentity();
  const navigate = useNavigate();

  return (
    <div className="aks-root">
      <style>{CSS}</style>
      <div className="aks-in">
        <header className="aks-head">
          <button type="button" className="aks-back" onClick={() => navigate(-1)} aria-label="Back">
            <HandArrowLeft size={14} />
          </button>
          <h1 className="aks-title">Where this comes from</h1>
        </header>

        <p className="aks-lead">
          Every answer AINUBIS gives is cut from these documents. This is the brain that
          answers you — {VAULT_SOURCE_TOTALS.scrolls} scrolls distilled from{' '}
          {VAULT_SOURCE_TOTALS.documents} sources. The worlds of the Vault are a different
          shelf of the same library, and they are still being written.
        </p>

        <div className="aks-nums">
          <span className="aks-num"><b>{VAULT_SOURCE_TOTALS.scrolls}</b><em>scrolls</em></span>
          <span className="aks-num"><b>{VAULT_SOURCE_TOTALS.documents}</b><em>documents</em></span>
          <span className="aks-num"><b>{VAULT_SOURCE_TOTALS.inHouse}</b><em>written here</em></span>
        </div>

        {VAULT_SOURCES.map((s) => (
          <article className="aks-src" key={s.key}>
            <h2>{s.title}</h2>
            <p className="aks-au">
              {[s.author, s.year, s.extent, s.kind].filter(Boolean).join(' · ')}
            </p>
            <div className="aks-mt">
              <span><b>{s.scrolls}</b> scrolls</span>
              <span>{s.tags.join(' · ')}</span>
            </div>
          </article>
        ))}

        {/* 🔴 NEEXISTUJÚCI ZDROJ SA NEPÍŠE AKO NULA. AINUBIS dnes nemá nástroj na
            vyhľadávanie na internete; nula v rade s 270 a 184 by vyzerala ako
            zdroj, ktorý sa zatiaľ nepoužil. */}
        {!WEB_RESEARCH_EXISTS && (
          <div className="aks-none">
            <h2>Web research</h2>
            <p>None. AINUBIS cannot search the internet — everything above came in as a document.</p>
          </div>
        )}

        <p className="aks-note">
          <b>Mock-up.</b> The numbers are measured from the corpus as it stood on 24 September
          2026 and are written into the page. Before this screen goes live it has to ask the
          corpus itself, or it will start lying about the one thing it exists to prove.
        </p>
      </div>

      <PackBottomNav avatarUrl={id.avatarUrl} avatarInitial={id.avatarInitial} dogs={id.dogs} />
      <MessagingOverlayHost />
    </div>
  );
}
