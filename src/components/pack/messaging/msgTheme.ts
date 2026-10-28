// ════════════════════════════════════════════════════════════════════════════
// SPRÁVY — JEDEN ŠAT, BLEDÉ POZADIE BEZ HEROGLYFOV (28. 10. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 28. 10.: „urobme tú stránku bez D-bloku = na celú šírku ako to má Instagram,
// a použi bledé pozadie bez heroglyfov."
//
// Do 28. 10. mali správy svetlý aj tmavý šat (prepínač zrušený skôr, tmavý šat visel v CSS
// ako zamrznutý) a tapetu heroglyfov pod sklenenou doskou. Všetko to je preč: zostáva ploché
// papyrusové pozadie `PAPER_BG` a sada premenných `--msg-*`, ktoré čítajú `Inbox.tsx`
// a `Thread.tsx`.
//
// MOJA bublina = lapis (hlas „ja"), odosielacie tlačidlo tá istá rodina. Cudzia = bledý blok.
// ════════════════════════════════════════════════════════════════════════════
import { PACK_THEME, PAPER_BG } from '@/components/pack/packTheme';

const T = PACK_THEME;

export const MSG_SKIN_CSS = `
.msg-skin{
  --msg-page:${PAPER_BG};
  --msg-bar:${T.panelGrad};
  --msg-bar-edge:rgba(179,130,45,0.55);
  --msg-bar-shadow:0 2px 10px rgba(122,90,42,0.10);
  --msg-title:#8A5F1E;
  --msg-ink:${T.inkStrong};
  --msg-dim:${T.inkWarm};
  --msg-faint:rgba(42,22,8,0.42);
  --msg-block:${T.panelGrad};
  --msg-block-edge:${T.cardEdge};
  --msg-block-ink:${T.inkStrong};
  --msg-block-shadow:0 2px 6px rgba(122,90,42,0.16), inset 0 1px 0 rgba(255,255,255,0.45);
  /* MOJA bublina + odosielacie tlačidlo = jedna rodina „ja". */
  --msg-mine:linear-gradient(180deg,#16307A,#0A1A4A);
  --msg-mine-hover:linear-gradient(180deg,#1E3C90,#0F2560);
  --msg-mine-edge:#0A1A4A;
  --msg-mine-ink:#EFD79A;
  --msg-mine-shadow:0 4px 13px -3px rgba(5,15,48,0.6), inset 0 1px 0 ${T.hairline};
  --msg-focus:#16307A;
  --msg-focus-halo:rgba(22,48,122,0.22);
  --msg-btn:rgba(255,251,240,0.55);
  --msg-btn-edge:rgba(179,130,45,0.55);
  --msg-btn-ink:${T.inkStrong};
  --msg-btn-hot:${T.card};
  --msg-field:${T.card};
  --msg-field-ink:${T.inkStrong};
  --msg-chip:rgba(201,154,63,0.20);
  --msg-chip-hot:rgba(201,154,63,0.32);
  --msg-chip-ink:#8A5F1E;
  --msg-err:#8E2A20;
  --msg-off:rgba(201,154,63,0.20);
  /* Jemné oddelenie riadkov inboxu a podklad dotyku (IG Direct). */
  --msg-sep:rgba(179,130,45,0.28);
  --msg-row-hot:rgba(201,154,63,0.14);
  /* Ikonka v tlačidle odoslania na lapise = biela (doslovný reťazec z FILTERS v BrandIcon.tsx,
     ten ich sype inline, takže sa prebíja len cez !important). */
  --msg-icon:brightness(0) invert(1);
}
/* PODKLAD STRÁNKY = plochý papyrus, BEZ tapety heroglyfov (ani ::before/::after). */
.msg-skin{position:relative;background-color:var(--msg-page);color:var(--msg-ink);}
`;
