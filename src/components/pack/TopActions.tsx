// ── SOS + SPRÁVY + UPOZORNENIA — JEDNA KAPSULA PRE CELÝ /pack (Matej 9. 11. 2026) ───────────────────
// *„Pilulka koleso + obálka + zvonček: obálka presne v strede, rovnomerné rozostupy. Tá istá pilulka
//  (veľkosť, rozloženie) na všetkých stránkach: feed, mapa, AINUBIS, ostatné. Jeden komponent."*
// Dovtedy ju skladali na troch miestach (`PackTopRow`, `PackMap`, `PackIdentityBar`) a každé s iným
// rozostupom a lemom: SOS ↔ správy 12, správy ↔ zvonček 4, na mape 0 + 4 a výška 45 proti 36.
// Geometria = `TOP_CAPSULE` v `TopCircle.tsx`. NOVÝ POVRCH SI KAPSULU NEKRESLÍ — vloží `<TopActions />`.
// ⚠️ Mapa (`PackMap.tsx`) má volať TOTO (`<TopActions dark={dark} className="trp-header-notif" last24h=… total=… />`).
// Mimo APP_NEW (web) ostáva staré poradie `SosButton` + `PackNotifications` presne ako bolo.
import { PackNotifications } from './PackNotifications';
import { SosButton } from './SosButton';
import { TOP_BTN_PX, TOP_CAPSULE } from './TopCircle';
import { APP_NEW, DEV_FULL } from '@/lib/packFlags';
import { SOS_ON, VET_ER_ON } from '@/lib/env';

// `.pk-tops.pk-p3d-tops` (dve triedy) prebije základ `.pk-p3d-tops` z `lib/papyrus3d.ts` bez ohľadu na poradie.
const CSS = `
.pk-tops.pk-p3d-tops{box-sizing:border-box;height:${TOP_BTN_PX + 2 * TOP_CAPSULE.border}px;padding:0 ${TOP_CAPSULE.padX}px;border-width:${TOP_CAPSULE.border}px;gap:${TOP_CAPSULE.gap}px;flex:none;}
`;

export function TopActions({ dark = false, last24h, total, className, layout = 'inline' }: {
  dark?: boolean;
  last24h: number | null;
  total: number | null;
  className?: string;
  layout?: 'overlay' | 'inline';
}) {
  const sos = (VET_ER_ON || SOS_ON) ? <SosButton /> : null;
  const notif = DEV_FULL ? <PackNotifications dark={dark} last24h={last24h} total={total} className={className} layout={layout} capsule /> : null;
  if (!APP_NEW) return <>{sos}{notif}</>;
  return (
    <div className="pk-p3d-tops pk-tops">
      <style>{CSS}</style>
      {sos}
      {notif}
    </div>
  );
}
