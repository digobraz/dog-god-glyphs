// MapLocked — čo uvidí človek, ktorý na mapu ešte nesmie (2026-08-22, beh 1 zadania
// `plany/zadanie-mapa-composer-2026-08-22.md` §1.5).
//
// PREDTÝM: `MapGate` mal dva stavy a ten druhý bol `<Navigate to="/pack" replace />` —
// teda TICHÉ ODHODENIE. Platiaci člen klikol na mapu a ocitol sa späť na homepage bez
// jediného slova o tom, čo sa stalo (priznané v hlavičke `QuickTiles.tsx`: „slepá ulička
// pre platiaceho člena"). Neprihlásený skončil o krok ďalej na `/login`, tiež bez toho,
// aby sa dozvedel, čo je za tými dverami.
//
// TERAZ sú to dve rôzne správy pre dvoch rôznych ľudí:
//   · `variant="soon"`  — si vnútri, mapa sa otvára o chvíľu (člen bez founder výnimky)
//   · `variant="join"`  — nie si vnútri, toto je pozvánka (bez session)
//
// ⚠️ Toto NIE JE verejný náhľad mapy. Ten je beh 5 zadania (tri stavy `MapGate`, kurátorované
// výlety naplno, stena na akciách). Dovtedy tu stojí obrazovka, nie prázdno.
//
// Dizajn: papyrusová karta = lock z `Entry.tsx` (`PACK_BOX.card`), CTA = `.btn-gold` LOCK
// (gradient 135°, radius 8, papyrusový rám) — lokálna kópia presných hodnôt, rovnako ako
// to robí `TripSpotlight.tsx` / `FounderInvite.tsx`; `.btn-gold` žije v `SpiralLanding.css`
// a globálne sa neimportuje. Dva fonty: Cinzel = identita, Space Grotesk = text.
import { Link } from 'react-router-dom';
import { PageTopBar } from '@/components/PageTopBar';
import { PACK_THEME, PACK_BOX, FONT_TITLE, FONT_UI } from './packTheme';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

const CSS = `
.mlk-wrap{min-height:100dvh;background:${T.pageBg};display:flex;flex-direction:column;}
.mlk-body{flex:1;display:flex;align-items:center;justify-content:center;padding:24px 16px 64px;}
.mlk-card{width:100%;max-width:460px;padding:28px 22px 26px;text-align:center;}
.mlk-eyebrow{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${T.cardEdge};}
.mlk-title{font-family:${FONT_TITLE};font-weight:700;font-size:22px;line-height:1.2;letter-spacing:.02em;text-transform:uppercase;color:${T.inkStrong};margin-top:10px;}
.mlk-sub{font-family:${FONT_UI};font-weight:400;font-size:13.5px;line-height:1.55;color:${T.inkWarm};margin-top:12px;}
.mlk-rule{height:2px;margin:20px 0;background:${T.rule};}
.mlk-actions{display:flex;flex-direction:column;gap:10px;}
/* .btn-gold (brand manuál v3.2 — LOCKED): gradient 135°, radius 8 (NIE pilulka),
   papyrusový rám, zlatý dosvit. Nedoladovať. */
.mlk-cta{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 22px;border-radius:8px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);border:1px solid rgba(250,244,236,0.30);color:#000;font-family:${FONT_TITLE};font-weight:700;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;box-shadow:0 0 40px rgba(230,158,26,0.4), inset 0 1px 0 rgba(255,255,255,0.3);transition:transform .2s, box-shadow .22s;}
.mlk-cta:hover{box-shadow:0 0 56px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.3);}
.mlk-cta:active{transform:scale(0.98);}
.mlk-ghost{display:inline-flex;align-items:center;justify-content:center;padding:11px 22px;border-radius:8px;background:transparent;border:1px solid ${T.cardEdge};color:${T.inkStrong};font-family:${FONT_UI};font-weight:600;font-size:11px;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;}
.mlk-ghost:hover{background:rgba(201,154,63,0.12);}
`;

export type MapLockedVariant = 'soon' | 'join';

export function MapLocked({ variant }: { variant: MapLockedVariant }) {
  const t = useT();
  const soon = variant === 'soon';
  return (
    <div className="mlk-wrap">
      <style>{CSS}</style>
      <PageTopBar />
      <div className="mlk-body">
        <div className="mlk-card" style={PACK_BOX.card}>
          <div className="mlk-eyebrow">{t('pack.mapLocked.eyebrow')}</div>
          <h1 className="mlk-title">
            {soon ? t('pack.mapLocked.soonTitle') : t('pack.mapLocked.joinTitle')}
          </h1>
          <p className="mlk-sub">
            {soon ? t('pack.mapLocked.soonSub') : t('pack.mapLocked.joinSub')}
          </p>
          <div className="mlk-rule" />
          <div className="mlk-actions">
            {soon ? (
              <Link className="mlk-cta" to="/pack">{t('pack.mapLocked.backToPack')}</Link>
            ) : (
              <>
                <Link className="mlk-cta" to="/heroglyph">{t('pack.mapLocked.become')}</Link>
                <Link className="mlk-ghost" to="/login?return=%2Fpack%2Fmap">
                  {t('pack.mapLocked.alreadyMember')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
